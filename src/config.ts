export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemma-4-26b-a4b-it';

if (!DISCORD_TOKEN) throw new Error('Missing DISCORD_TOKEN');
if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

export const CHANNEL_CTX_SIZE = 5;
export const REPLIED_MSG_CTX_RADIUS = 2;
export const MIN_REPLY_CHAIN_LENGTH = 5
export const MAX_REPLY_CHAIN_LENGTH = 10
