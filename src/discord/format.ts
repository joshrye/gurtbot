import type { Message } from 'discord.js';
import type { Turn } from '../types.ts';

export function asTurn(message: Message, botId: string): Turn {
  const isBotMsg = message.author.id === botId;
  const name = message.member?.displayName ?? message.author.displayName;
  const text = message.content

  return {
    role: isBotMsg ? 'model' : 'user',
    text,
    metadata: {
      messageId: message.id,
      repliedToMessageId: message.reference?.messageId,
      authorId: message.author.id,
      authorName: name,
      createdAt: message.createdAt.toISOString()
    },
  };
}

export function stripMention(content: string, botId: string): string {
  return content.replace(new RegExp(`<@!?${botId}>`, 'g'), '').trim();
}
