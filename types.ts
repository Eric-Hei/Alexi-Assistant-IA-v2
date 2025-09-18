export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  text: string;
}

// Extended Persona interface with additional metadata
export interface Persona {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isCustom?: boolean;
  isPredefined?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Persona categories for organization
export enum PersonaCategory {
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  PERSONAL = 'personal',
  TECHNICAL = 'technical',
  OTHER = 'other'
}

// Chat session interface for managing multiple conversations
export interface ChatSession {
  id: string;
  personaId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

// Application state interface
export interface AppState {
  currentPersonaId: string | null;
  currentChatSession: ChatSession | null;
  personas: Persona[];
  chatSessions: ChatSession[];
  sidebarCollapsed: boolean;
  defaultPersonaId: string | null;
}

// CRUD operations interfaces
export interface PersonaFormData {
  name: string;
  prompt: string;
  description?: string;
  category?: PersonaCategory;
  color?: string;
  icon?: string;
}

export interface PersonaManagerActions {
  createPersona: (data: PersonaFormData) => Promise<Persona>;
  updatePersona: (id: string, data: Partial<PersonaFormData>) => Promise<Persona>;
  deletePersona: (id: string) => Promise<void>;
  setDefaultPersona: (id: string) => Promise<void>;
  duplicatePersona: (id: string) => Promise<Persona>;
}

// Storage interface for localStorage management
export interface StorageData {
  personas: Persona[];
  defaultPersonaId: string | null;
  chatSessions: ChatSession[];
  settings: {
    sidebarCollapsed: boolean;
    theme?: string;
    messageInputRows?: number;
  };
}
