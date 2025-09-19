
import React, { useState, useCallback, useEffect } from 'react';
import { Message, Role, Persona, PersonaFormData, PersonaCategory } from './types';
import { albertApi } from './src/services/albertApi';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import PersonaModal from './components/PersonaModal';
import CloudSync from './components/CloudSync';
import { usePersonaManager } from './hooks/usePersonaManager';
import { useSettings } from './hooks/useSettings';

const App: React.FC = () => {
  // Persona management
  const {
    personas,
    loading: personasLoading,
    createPersona,
    updatePersona,
    deletePersona,
    setDefaultPersona,
    getDefaultPersona,
  } = usePersonaManager();



  // Settings management
  const {
    settings,
    loading: settingsLoading,
    setSidebarCollapsed,
    setMessageInputRows,
  } = useSettings();

  // App state
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [cloudSyncOpen, setCloudSyncOpen] = useState<boolean>(false);

  // Initialize chat with a persona
  const initializeChat = useCallback((persona: Persona) => {
    setCurrentPersona(persona);
    setMessages([]);
    setError(null);
  }, []);

  // Switch to a different persona
  const switchPersona = useCallback((persona: Persona) => {
    if (currentPersona?.id === persona.id) return;

    // Save current chat state if needed (future feature)
    initializeChat(persona);
  }, [currentPersona, initializeChat]);

  // Start a new conversation with the same persona
  const handleNewConversation = () => {
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentPersona || isLoading) {
      setError('Aucun assistant sélectionné. Veuillez d\'abord choisir un assistant.');
      return;
    }

    const userMessage: Message = {
      role: Role.USER,
      text,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history for Albert API
      const conversationHistory = messages.map((msg: Message) => ({
        role: msg.role === Role.USER ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Intercepter les logs pour détecter les tentatives de retry
      const originalLog = console.log;
      const originalWarn = console.warn;
      let retryCount = 0;

      console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('Tentative') && message.includes('Albert API')) {
          const match = message.match(/Tentative (\d+)\/(\d+)/);
          if (match) {
            retryCount = parseInt(match[1]);
            if (retryCount > 1) {
              setError(`🔄 Nouvelle tentative ${retryCount}/3 avec Albert...`);
            }
          }
        }
        originalLog(...args);
      };

      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('Erreur 500') && message.includes('nouvelle tentative')) {
          setError('⚠️ Albert temporairement indisponible, nouvelle tentative...');
        }
        originalWarn(...args);
      };

      // Send message using Albert API service
      const responseText = await albertApi.sendMessage(
        currentPersona.prompt,
        conversationHistory,
        text
      );

      // Restaurer les logs originaux
      console.log = originalLog;
      console.warn = originalWarn;

      // Effacer le message d'erreur de retry si tout s'est bien passé
      if (retryCount > 1) {
        setError('');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.ASSISTANT,
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev: Message[]) => [...prev, aiMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Une erreur inconnue s\'est produite.';
      console.error("Erreur lors de l'envoi du message:", errorMessage);
      setError(`Désolé, quelque chose s'est mal passé. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Modal handlers
  const handleCreatePersona = () => {
    setEditingPersona(null);
    setModalOpen(true);
  };

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona);
    setModalOpen(true);
  };

  const handleSavePersona = async (data: PersonaFormData) => {
    try {
      if (editingPersona) {
        await updatePersona(editingPersona.id, data);
      } else {
        await createPersona(data);
      }
      setModalOpen(false);
      setEditingPersona(null);
    } catch (error) {
      console.error('Error saving persona:', error);
      setError('Failed to save persona');
    }
  };

  const handleCloudSync = () => {
    setCloudSyncOpen(true);
  };

  const handleCloseCloudSync = () => {
    setCloudSyncOpen(false);
  };

  const handleImportFromCloud = async (importedPersonas: Persona[]) => {
    try {
      for (const persona of importedPersonas) {
        await createPersona({
          name: persona.name,
          prompt: persona.prompt,
          description: persona.description,
          category: persona.category as PersonaCategory,
          color: persona.color,
          icon: persona.icon,
        });
      }
      setError('');
    } catch (error) {
      console.error('Error importing personas from cloud:', error);
      setError('Erreur lors de l\'importation depuis le cloud');
    }
  };

  const handleDeletePersona = async (persona: Persona) => {
    try {
      await deletePersona(persona.id);
      if (currentPersona?.id === persona.id) {
        // Switch to default persona if current one is deleted
        const defaultPersona = getDefaultPersona();
        if (defaultPersona) {
          switchPersona(defaultPersona);
        }
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
      setError('Failed to delete persona');
    }
  };

  const handleSetDefaultPersona = async (persona: Persona) => {
    try {
      await setDefaultPersona(persona.id);
    } catch (error) {
      console.error('Error setting default persona:', error);
      setError('Failed to set default persona');
    }
  };

  const handleImportPersonas = async (importedPersonas: Persona[]) => {
    try {
      for (const persona of importedPersonas) {
        await createPersona({
          name: persona.name,
          prompt: persona.prompt,
          description: persona.description,
          category: persona.category as PersonaCategory,
          color: persona.color,
          icon: persona.icon,
        });
      }
    } catch (error) {
      console.error('Error importing personas:', error);
      setError('Failed to import personas');
    }
  };

  const handleExportPersonas = () => {
    // This is handled by the CategoryManager component
    console.log('Personas exported successfully');
  };

  // Initialize with default persona on load
  useEffect(() => {
    if (!personasLoading && !settingsLoading && personas.length > 0 && !currentPersona) {
      const defaultPersona = getDefaultPersona();
      if (defaultPersona) {
        initializeChat(defaultPersona);
      }
    }
  }, [personasLoading, settingsLoading, personas, currentPersona, getDefaultPersona, initializeChat]);

  if (personasLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setSidebarCollapsed(!settings.sidebarCollapsed)}
          className="p-2 bg-gray-800 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Basculer le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      {(!settings.sidebarCollapsed || window.innerWidth >= 768) && (
        <Sidebar
          personas={personas}
          currentPersonaId={currentPersona?.id || null}
          collapsed={settings.sidebarCollapsed && window.innerWidth >= 768}
          onPersonaSelect={switchPersona}
          onPersonaCreate={handleCreatePersona}
          onPersonaEdit={handleEditPersona}
          onPersonaDelete={handleDeletePersona}
          onToggleCollapse={() => setSidebarCollapsed(!settings.sidebarCollapsed)}
          onImportPersonas={handleImportPersonas}
          onExportPersonas={handleExportPersonas}
          onCloudSync={handleCloudSync}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">


        {/* Error Display */}
        {error && (
          <div className="bg-red-500 text-white p-3 m-4 rounded-lg text-center">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Chat Area */}
        {currentPersona ? (
          <>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              currentPersona={currentPersona}
              onNewConversation={handleNewConversation}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              rows={settings.messageInputRows}
              onRowsChange={setMessageInputRows}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl px-6">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue dans Alexi Assistant</h2>
              <p className="text-gray-400 mb-4">Sélectionnez un assistant dans la barre latérale pour commencer à discuter</p>

              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-sm text-green-200">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>API Albert d'Etalab - Prêt !</strong>
                </div>
                <p className="mb-2">
                  ✅ Serveur proxy actif • ✅ Modèle albert-large (Mistral-Small-3.2-24B)
                </p>
                <p className="text-xs text-green-300">
                  Sélectionnez un assistant et commencez à discuter avec l'IA française !
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persona Modal */}
      <PersonaModal
        isOpen={modalOpen}
        persona={editingPersona}
        onClose={() => {
          setModalOpen(false);
          setEditingPersona(null);
        }}
        onSave={handleSavePersona}
        onDelete={handleDeletePersona}
        onSetDefault={handleSetDefaultPersona}
      />

      {cloudSyncOpen && (
        <CloudSync
          personas={personas}
          onImportPersonas={handleImportFromCloud}
          onClose={handleCloseCloudSync}
        />
      )}
    </div>
  );
};

export default App;
