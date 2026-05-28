import OpenAI from "openai";
import process from "node:process";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export const OPENROUTER_MODEL = "anthropic/claude-sonnet-4";

let _client: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: OPENROUTER_BASE,
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://traduz-ai.vercel.app",
        "X-Title": "Traduz.ai",
      },
    });
  }
  return _client;
}
