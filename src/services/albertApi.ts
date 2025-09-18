// Albert API service
// Documentation: https://albert.api.etalab.gouv.fr/documentation

export interface AlbertMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AlbertChatRequest {
  model: string;
  messages: AlbertMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AlbertChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const ALBERT_API_BASE_URL = import.meta.env.VITE_ALBERT_API_BASE_URL || 'http://localhost:3001/api/albert';
const ALBERT_API_KEY = import.meta.env.VITE_ALBERT_API_KEY;

// Available models (based on API response)
export const ALBERT_MODELS = {
  ALBERT_SMALL: 'albert-small', // Llama-3.1-8B-Instruct
  ALBERT_LARGE: 'albert-large', // Mistral-Small-3.1-24B-Instruct
  ALBERT_CODE: 'albert-code',   // Qwen2.5-Coder-32B-Instruct
  ALBERT_SPP: 'AgentPublic/albert-spp-8b', // Albert SPP 8B
} as const;

export class AlbertApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = ALBERT_API_KEY, baseUrl: string = ALBERT_API_BASE_URL) {
    if (!apiKey) {
      throw new Error('VITE_ALBERT_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chatCompletion(request: AlbertChatRequest): Promise<AlbertChatResponse> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 seconde entre les tentatives

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentative ${attempt}/${maxRetries} pour Albert API...`);

        const url = `${this.baseUrl}/v1/chat/completions`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: request.model || ALBERT_MODELS.ALBERT_LARGE,
            messages: request.messages,
            max_tokens: request.max_tokens || 2000,
            temperature: request.temperature || 0.7,
            stream: false,
          }),
        });

        // Si c'est une erreur 500 et qu'on peut encore retenter
        if (response.status === 500 && attempt < maxRetries) {
          console.warn(`Erreur 500 d'Albert (tentative ${attempt}/${maxRetries}), nouvelle tentative dans ${retryDelay}ms...`);
          await this.delay(retryDelay);
          continue;
        }

        // Pour toutes les autres erreurs ou si on a épuisé les tentatives
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Erreur API Albert: ${response.status} - ${
              errorData.error?.message || response.statusText
            }${attempt > 1 ? ` (après ${attempt} tentatives)` : ''}`
          );
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Réponse invalide de l\'API Albert');
        }

        if (attempt > 1) {
          console.log(`✅ Succès Albert après ${attempt} tentatives`);
        }

        return data;

      } catch (error) {
        // Si c'est la dernière tentative ou une erreur non-réseau, on lance l'erreur
        if (attempt === maxRetries || !(error instanceof Error && error.message.includes('500'))) {
          throw error;
        }

        console.warn(`Erreur tentative ${attempt}/${maxRetries}:`, error.message);
        await this.delay(retryDelay);
      }
    }

    // Cette ligne ne devrait jamais être atteinte, mais TypeScript l'exige
    throw new Error('Erreur inattendue lors des tentatives Albert');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(
    systemPrompt: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<string> {
    const messages: AlbertMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await this.chatCompletion({
      model: ALBERT_MODELS.ALBERT_LARGE,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }
}

// Export a default instance
export const albertApi = new AlbertApiService();
