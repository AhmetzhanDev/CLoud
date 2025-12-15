import OpenAI from 'openai';
import axios from 'axios';

interface AIServiceConfig {
  provider: 'openai' | 'ollama';
  openaiApiKey?: string;
  ollamaApiUrl?: string;
  model?: string;
  timeout?: number;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private config: AIServiceConfig;
  private openaiClient?: OpenAI;

  constructor(config?: Partial<AIServiceConfig>) {
    // Default configuration
    this.config = {
      provider: process.env.OPENAI_API_KEY ? 'openai' : 'ollama',
      openaiApiKey: process.env.OPENAI_API_KEY,
      ollamaApiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
      model: process.env.OPENAI_API_KEY ? 'gpt-4-turbo-preview' : 'llama2',
      timeout: 60000, // 60 seconds
      ...config,
    };

    // Initialize OpenAI client if using OpenAI
    if (this.config.provider === 'openai' && this.config.openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.openaiApiKey,
        timeout: this.config.timeout,
      });
    }
  }

  /**
   * Generate a completion using the configured AI provider
   */
  async generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;

    try {
      if (this.config.provider === 'openai') {
        return await this.generateOpenAICompletion(
          prompt,
          systemPrompt,
          temperature,
          maxTokens
        );
      } else {
        return await this.generateOllamaCompletion(
          prompt,
          systemPrompt,
          temperature,
          maxTokens
        );
      }
    } catch (error) {
      // If primary provider fails, try fallback
      if (this.config.provider === 'openai') {
        console.warn('OpenAI failed, falling back to Ollama:', error);
        return await this.generateOllamaCompletion(
          prompt,
          systemPrompt,
          temperature,
          maxTokens
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate completion using OpenAI API
   */
  private async generateOpenAICompletion(
    prompt: string,
    systemPrompt?: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const completion = await this.openaiClient.chat.completions.create({
      model: this.config.model || 'gpt-4-turbo-preview',
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    return {
      content,
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  }

  /**
   * Generate completion using Ollama API
   */
  private async generateOllamaCompletion(
    prompt: string,
    systemPrompt?: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    const ollamaUrl = `${this.config.ollamaApiUrl}/api/generate`;

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await axios.post(
      ollamaUrl,
      {
        model: this.config.model || 'llama2',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      },
      {
        timeout: this.config.timeout,
      }
    );

    return {
      content: response.data.response || '',
    };
  }

  /**
   * Check if AI service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.config.provider === 'openai') {
        if (!this.openaiClient) {
          return false;
        }
        // Try a simple completion
        await this.openaiClient.chat.completions.create({
          model: this.config.model || 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        });
        return true;
      } else {
        // Check Ollama availability
        const response = await axios.get(
          `${this.config.ollamaApiUrl}/api/tags`,
          { timeout: 5000 }
        );
        return response.status === 200;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current provider
   */
  getProvider(): string {
    return this.config.provider;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.config.model || 'unknown';
  }
}

// Export singleton instance
export const aiService = new AIService();
