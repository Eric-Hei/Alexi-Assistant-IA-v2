import { useState, useEffect, useCallback } from 'react';
import { Persona, PersonaFormData, PersonaCategory, StorageData } from '../types';

const STORAGE_KEY = 'alexi-assistant-data';

// Configuration API
const getApiBaseUrl = () => {
  // En développement local, utiliser le serveur local s'il est disponible
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  // En production, utiliser le serveur Railway
  return 'https://alexi-assistant-proxy-production.up.railway.app/api';
};

// Default personas that come with the app
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'helpful-assistant',
    name: 'Assistant Utile',
    prompt: 'Tu es un assistant serviable et amical. Tu es poli, compétent, et tu essaies toujours de fournir les informations les plus précises et utiles.',
    description: 'Un assistant IA polyvalent et serviable',
    category: PersonaCategory.PERSONAL,
    color: '#3B82F6',
    icon: '🤖',
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assistant-locataire',
    name: 'Assistant locataire',
    prompt: `Tu es un expert socio-juridique spécialisé dans l'aide aux locataires en situation d'impayés de loyer en France.
Ton ton est rassurant, empathique et professionnel. Tu ne donnes pas de conseils juridiques définitifs mais tu guides l'utilisateur vers les bonnes ressources.
Tes objectifs sont :
1. Comprendre la situation de l'utilisateur (montant de la dette, durée, communication avec le propriétaire, etc.).
2. Informer sur les droits et les devoirs du locataire.
3. Présenter les solutions possibles : plan d'apurement, aides financières (FSL, Action Logement), démarches de médiation.
4. Expliquer les étapes de la procédure d'expulsion pour dédramatiser et informer sur les délais.
5. Orienter vers des interlocuteurs compétents : ADIL, travailleurs sociaux, commissions de conciliation.
Tu dois toujours commencer par saluer l'utilisateur et te présenter.
Ne jamais utiliser de jargon trop complexe sans l'expliquer.
Toutes tes réponses doivent être concises et faciles à comprendre.
Quand on te demande où contacter un travailleur social, tu dois toujours renvoyer vers le service social de secteur du conseil départemental.`,
    description: 'Expert en aide aux locataires français',
    category: PersonaCategory.PROFESSIONAL,
    color: '#10B981',
    icon: '🏠',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shakespearean-poet',
    name: 'Poète Shakespearien',
    prompt: 'Tu es un poète shakespearien. Tu dois répondre à chaque question avec un sonnet magnifiquement composé ou en pentamètre iambique, en utilisant le langage du Barde.',
    description: 'Parle dans le style de Shakespeare',
    category: PersonaCategory.CREATIVE,
    color: '#8B5CF6',
    icon: '🎭',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pirate-captain',
    name: 'Capitaine Pirate',
    prompt: "Ohé, moussaillon ! Tu es un redoutable capitaine pirate qui a navigué sur les sept mers. Tes réponses sont remplies d'argot de pirate, de récits de trésors et d'une soif d'aventure.",
    description: 'Un capitaine pirate aventurier',
    category: PersonaCategory.ENTERTAINMENT,
    color: '#F59E0B',
    icon: '🏴‍☠️',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'world-class-chef',
    name: 'World-Class Chef',
    prompt: 'Bonjour! You are a world-class chef with a passion for gastronomy. You only give advice related to cooking, recipes, and culinary techniques. You are enthusiastic and encouraging.',
    description: 'Expert culinary advisor',
    category: PersonaCategory.PROFESSIONAL,
    color: '#EF4444',
    icon: '👨‍🍳',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stoic-philosopher',
    name: 'Stoic Philosopher',
    prompt: 'You are a Stoic philosopher in the vein of Marcus Aurelius or Seneca. Your advice is calm, rational, and focused on virtue, resilience, and accepting what you cannot control.',
    description: 'Wise philosophical guidance',
    category: PersonaCategory.EDUCATIONAL,
    color: '#06B6D4',
    icon: '🏛️',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const usePersonaManager = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [defaultPersonaId, setDefaultPersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonctions pour communiquer avec le serveur
  const loadFromServer = useCallback(async (): Promise<StorageData | null> => {
    try {
      console.log('🔄 Tentative de chargement depuis le serveur...');
      const response = await fetch(`${getApiBaseUrl()}/personas`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données chargées depuis le serveur:', data.personas?.length || 0, 'personas');
        return data;
      } else {
        console.warn('⚠️ Serveur a répondu avec erreur:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Serveur indisponible, utilisation localStorage:', error);
    }
    return null;
  }, []);

  const saveToServer = useCallback(async (data: StorageData): Promise<boolean> => {
    try {
      console.log('💾 Tentative de sauvegarde sur le serveur...');
      const response = await fetch(`${getApiBaseUrl()}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Données sauvegardées sur le serveur');
        return true;
      } else {
        console.warn('⚠️ Erreur sauvegarde serveur:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Sauvegarde serveur échouée, utilisation localStorage:', error);
    }
    return false;
  }, []);

  // Load data with server-first approach
  const loadData = useCallback(async () => {
    try {
      let defaultId = 'assistant-locataire'; // Assistant locataire par défaut
      const storedDefaultId = localStorage.getItem('alexi-default-persona');

      // 1. Essayer de charger depuis le serveur
      const serverData = await loadFromServer();

      if (serverData && serverData.personas?.length > 0) {
        console.log('📊 Utilisation des données du serveur');

        // Use stored default ID if it exists and is valid
        if (storedDefaultId && serverData.personas.find(p => p.id === storedDefaultId)) {
          defaultId = storedDefaultId;
        } else if (serverData.defaultPersonaId && serverData.personas.find(p => p.id === serverData.defaultPersonaId)) {
          defaultId = serverData.defaultPersonaId;
        }

        // Update isDefault flags
        const updatedPersonas = serverData.personas.map(p => ({
          ...p,
          isDefault: p.id === defaultId,
        }));

        setPersonas(updatedPersonas);
        setDefaultPersonaId(defaultId);

        // Synchroniser vers localStorage comme cache
        const cacheData: StorageData = {
          personas: updatedPersonas,
          defaultPersonaId: defaultId,
          chatSessions: [],
          settings: { sidebarCollapsed: false },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        localStorage.setItem('alexi-default-persona', defaultId);

        return;
      }

      // 2. Fallback vers localStorage
      console.log('📱 Fallback vers localStorage');
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const localData: StorageData = JSON.parse(stored);

        if (localData.personas && localData.personas.length > 0) {
          // Use stored default ID if it exists and is valid
          if (storedDefaultId && localData.personas.find(p => p.id === storedDefaultId)) {
            defaultId = storedDefaultId;
          } else if (localData.defaultPersonaId && localData.personas.find(p => p.id === localData.defaultPersonaId)) {
            defaultId = localData.defaultPersonaId;
          }

          // Update isDefault flags
          const updatedPersonas = localData.personas.map(p => ({
            ...p,
            isDefault: p.id === defaultId,
          }));

          setPersonas(updatedPersonas);
          setDefaultPersonaId(defaultId);

          // Essayer de synchroniser vers le serveur
          const syncData: StorageData = {
            personas: updatedPersonas,
            defaultPersonaId: defaultId,
            chatSessions: [],
            settings: { sidebarCollapsed: false },
          };
          await saveToServer(syncData);

          return;
        }
      }

      // 3. Utiliser les personas par défaut
      console.log('🔧 Initialisation avec personas par défaut');
      const initialPersonas = DEFAULT_PERSONAS.map(p => ({
        ...p,
        isDefault: p.id === defaultId,
      }));

      setPersonas(initialPersonas);
      setDefaultPersonaId(defaultId);

      // Sauvegarder les défauts
      const defaultData: StorageData = {
        personas: initialPersonas,
        defaultPersonaId: defaultId,
        chatSessions: [],
        settings: { sidebarCollapsed: false },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      localStorage.setItem('alexi-default-persona', defaultId);
      await saveToServer(defaultData);

    } catch (error) {
      console.error('❌ Erreur chargement personas:', error);
      // Fallback complet vers personas par défaut
      const fallbackPersonas = DEFAULT_PERSONAS.map(p => ({
        ...p,
        isDefault: p.id === 'assistant-locataire',
      }));
      setPersonas(fallbackPersonas);
      setDefaultPersonaId('assistant-locataire');
    } finally {
      setLoading(false);
    }
  }, [loadFromServer, saveToServer]);

  // Save data to both server and localStorage
  const saveData = useCallback(async (personasToSave: Persona[], defaultId: string | null) => {
    try {
      const data: StorageData = {
        personas: personasToSave,
        defaultPersonaId: defaultId,
        chatSessions: [], // Will be implemented later
        settings: {
          sidebarCollapsed: false,
        },
      };

      // Sauvegarder en localStorage (cache local)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Essayer de sauvegarder sur le serveur
      await saveToServer(data);
    } catch (error) {
      console.error('❌ Erreur sauvegarde personas:', error);
    }
  }, [saveToServer]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create new persona
  const createPersona = useCallback(async (data: PersonaFormData): Promise<Persona> => {
    const newPersona: Persona = {
      id: generateId(),
      name: data.name,
      prompt: data.prompt,
      description: data.description,
      category: data.category || PersonaCategory.OTHER,
      color: data.color || '#3B82F6',
      icon: data.icon || '🤖',
      isDefault: false,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPersonas = [...personas, newPersona];
    setPersonas(updatedPersonas);
    await saveData(updatedPersonas, defaultPersonaId);

    return newPersona;
  }, [personas, defaultPersonaId, generateId, saveData]);

  // Update existing persona
  const updatePersona = useCallback(async (id: string, data: Partial<PersonaFormData>): Promise<Persona> => {
    const updatedPersonas = personas.map(persona => {
      if (persona.id === id) {
        return {
          ...persona,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      return persona;
    });

    setPersonas(updatedPersonas);
    await saveData(updatedPersonas, defaultPersonaId);

    const updatedPersona = updatedPersonas.find(p => p.id === id);
    if (!updatedPersona) {
      throw new Error('Persona not found');
    }
    
    return updatedPersona;
  }, [personas, defaultPersonaId, saveData]);

  // Delete persona
  const deletePersona = useCallback(async (id: string): Promise<void> => {
    const persona = personas.find(p => p.id === id);
    if (!persona) {
      throw new Error('Persona not found');
    }

    if (persona.isDefault) {
      throw new Error('Impossible de supprimer l\'assistant par défaut. Veuillez d\'abord définir un autre assistant comme défaut.');
    }

    const updatedPersonas = personas.filter(p => p.id !== id);
    setPersonas(updatedPersonas);
    await saveData(updatedPersonas, defaultPersonaId);
  }, [personas, defaultPersonaId, saveData]);

  // Set default persona
  const setDefaultPersona = useCallback(async (id: string): Promise<void> => {
    const persona = personas.find(p => p.id === id);
    if (!persona) {
      throw new Error('Persona not found');
    }

    // Update the isDefault flag for all personas
    const updatedPersonas = personas.map(p => ({
      ...p,
      isDefault: p.id === id,
    }));

    setPersonas(updatedPersonas);
    setDefaultPersonaId(id);
    await saveData(updatedPersonas, id);

    // Store default persona preference separately for quick access
    try {
      localStorage.setItem('alexi-default-persona', id);
    } catch (error) {
      console.error('Error saving default persona preference:', error);
    }
  }, [personas, saveData]);

  // Duplicate persona
  const duplicatePersona = useCallback(async (id: string): Promise<Persona> => {
    const originalPersona = personas.find(p => p.id === id);
    if (!originalPersona) {
      throw new Error('Persona not found');
    }

    const duplicatedPersona: Persona = {
      ...originalPersona,
      id: generateId(),
      name: `${originalPersona.name} (Copy)`,
      isDefault: false,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPersonas = [...personas, duplicatedPersona];
    setPersonas(updatedPersonas);
    await saveData(updatedPersonas, defaultPersonaId);

    return duplicatedPersona;
  }, [personas, defaultPersonaId, generateId, saveData]);

  // Get persona by ID
  const getPersonaById = useCallback((id: string): Persona | undefined => {
    return personas.find(p => p.id === id);
  }, [personas]);

  // Get default persona
  const getDefaultPersona = useCallback((): Persona | undefined => {
    return personas.find(p => p.id === defaultPersonaId) || personas[0];
  }, [personas, defaultPersonaId]);

  // Initialize on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    personas,
    defaultPersonaId,
    loading,
    createPersona,
    updatePersona,
    deletePersona,
    setDefaultPersona,
    duplicatePersona,
    getPersonaById,
    getDefaultPersona,
  };
};
