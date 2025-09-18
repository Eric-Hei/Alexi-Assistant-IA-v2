export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  text: string;
}

export interface Persona {
  name: string;
  prompt: string;
}
