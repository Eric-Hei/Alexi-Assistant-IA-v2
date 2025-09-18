
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role, Persona, PersonaFormData } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import PersonaModal from './components/PersonaModal';
import { usePersonaManager } from './hooks/usePersonaManager';
import { useSettings } from './hooks/useSettings';

const App: React.FC = () => {
  // Persona management
  const {
    personas,
    defaultPersonaId,
    loading: personasLoading,
    createPersona,
    updatePersona,
    deletePersona,
    setDefaultPersona,
    duplicatePersona,
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
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  // Initialize chat with a persona
  const initializeChat = useCallback((persona: Persona) => {
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const newChatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: persona.prompt,
        },
      });
      setCurrentPersona(persona);
      setChatSession(newChatSession);
      setMessages([]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Chat initialization failed:", errorMessage);
      setError(`Failed to initialize chatbot. Please check your API key and configuration. Details: ${errorMessage}`);
    }
  }, []);

  // Switch to a different persona
  const switchPersona = useCallback((persona: Persona) => {
    if (currentPersona?.id === persona.id) return;

    // Save current chat state if needed (future feature)
    initializeChat(persona);
  }, [currentPersona, initializeChat]);

  const handleSendMessage = async (text: string) => {
    if (!chatSession || isLoading) return;

    const userMessage: Message = { role: Role.USER, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatSession.sendMessageStream({ message: text });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: Role.MODEL, text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = modelResponse;
          return newMessages;
        });
      }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during message streaming.';
        console.error("Error sending message:", errorMessage);
        setError(`Sorry, something went wrong. ${errorMessage}`);
        // Remove the empty model message placeholder on error
        setMessages(prev => prev.filter((msg, index) => !(index === prev.length - 1 && msg.role === Role.MODEL && msg.text === '')));
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
          category: persona.category,
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
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 p-4 shadow-md border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:ml-0 ml-16">
              <div className="text-2xl" role="img" aria-label={`${currentPersona?.name || 'Alexi Assistant'} icon`}>
                {currentPersona?.icon || '🤖'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {currentPersona?.name || 'Alexi Assistant'}
                </h1>
                <p className="text-sm text-gray-400">
                  {currentPersona?.description || 'AI Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {currentPersona && (
                <button
                  onClick={() => handleEditPersona(currentPersona)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Edit current persona"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

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
        {chatSession ? (
          <>
            <ChatWindow messages={messages} isLoading={isLoading} />
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              rows={settings.messageInputRows}
              onRowsChange={setMessageInputRows}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue dans Alexi Assistant</h2>
              <p className="text-gray-400">Sélectionnez un assistant dans la barre latérale pour commencer à discuter</p>
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
    </div>
  );
};

export default App;
