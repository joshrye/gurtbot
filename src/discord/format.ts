import type { Message } from 'discord.js';
import type { Turn } from '../types.ts';

export function asTurn(message: Message, botId: string): Turn {
  const isBotMsg = message.author.id === botId;
  const name = message.member?.displayName ?? message.author.displayName;

  return {
    role: isBotMsg ? 'model' : 'user',
    text: isBotMsg ? message.content : `[${name}]: ${message.content}`,
  };
}

export function stripMention(content: string, botId: string): string {
  return content.replace(new RegExp(`<@!?${botId}>`, 'g'), '').trim();
}
