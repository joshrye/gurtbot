import { GoogleGenAI, ThinkingLevel, type HttpOptions, type HttpRetryOptions } from '@google/genai';
import { GEMINI_API_KEY, GEMINI_MODEL } from './config.ts';
import type { Turn } from './types.ts';

const httpRetryOptions: HttpRetryOptions = {
  attempts: 6,
};

const httpOptions: HttpOptions = {
  retryOptions: httpRetryOptions,
};

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY, httpOptions });

const config = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
  maxOutputTokens: 384,
};

export async function askllm(turns: Turn[], systemInstruction?: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: GEMINI_MODEL,
    config: { ...config, systemInstruction: systemInstruction ? [{ text: systemInstruction }] : undefined },
    contents: turns,
  });

  const text = result.text
    ?? result.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('');

  return text?.trim() || 'I could not generate a response.';
}
