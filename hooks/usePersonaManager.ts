import { useState, useEffect, useCallback } from 'react';
import { Persona, PersonaFormData, PersonaCategory, StorageData } from '../types';

const STORAGE_KEY = 'alexi-assistant-data';

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

  // Load data from localStorage
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let defaultId = DEFAULT_PERSONAS[0].id;

      // Check for stored default persona preference
      const storedDefaultId = localStorage.getItem('alexi-default-persona');

      if (stored) {
        const data: StorageData = JSON.parse(stored);

        // Merge default personas with custom ones, ensuring defaults are always present
        const customPersonas = data.personas.filter(p => p.isCustom);
        const mergedPersonas = [...DEFAULT_PERSONAS, ...customPersonas];

        // Use stored default ID if it exists and is valid
        if (storedDefaultId && mergedPersonas.find(p => p.id === storedDefaultId)) {
          defaultId = storedDefaultId;
        } else if (data.defaultPersonaId && mergedPersonas.find(p => p.id === data.defaultPersonaId)) {
          defaultId = data.defaultPersonaId;
        }

        // Update isDefault flags
        const updatedPersonas = mergedPersonas.map(p => ({
          ...p,
          isDefault: p.id === defaultId,
        }));

        setPersonas(updatedPersonas);
        setDefaultPersonaId(defaultId);
      } else {
        // First time setup
        const initialPersonas = DEFAULT_PERSONAS.map(p => ({
          ...p,
          isDefault: p.id === defaultId,
        }));

        setPersonas(initialPersonas);
        setDefaultPersonaId(defaultId);
        saveData(initialPersonas, defaultId);
        localStorage.setItem('alexi-default-persona', defaultId);
      }
    } catch (error) {
      console.error('Error loading persona data:', error);
      const fallbackPersonas = DEFAULT_PERSONAS.map(p => ({
        ...p,
        isDefault: p.id === DEFAULT_PERSONAS[0].id,
      }));
      setPersonas(fallbackPersonas);
      setDefaultPersonaId(DEFAULT_PERSONAS[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((personasToSave: Persona[], defaultId: string | null) => {
    try {
      const data: StorageData = {
        personas: personasToSave,
        defaultPersonaId: defaultId,
        chatSessions: [], // Will be implemented later
        settings: {
          sidebarCollapsed: false,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving persona data:', error);
    }
  }, []);

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
    saveData(updatedPersonas, defaultPersonaId);
    
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
    saveData(updatedPersonas, defaultPersonaId);
    
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
    saveData(updatedPersonas, defaultPersonaId);
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
    saveData(updatedPersonas, id);

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
    saveData(updatedPersonas, defaultPersonaId);
    
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
