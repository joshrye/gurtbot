import type { Message } from 'discord.js';
import type { BotIdentity, Turn } from '../types.ts';

export function asTurn(message: Message, bot: BotIdentity): Turn {
  const isBotMsg = message.author.id === bot.id;
  const name = message.author.username;
  const text = resolveMentions(message);

  return {
    role: isBotMsg ? 'model' : 'user',
    text: isBotMsg ? text : `[${name}]: ${text}`,
  };
}

export function stripMention(content: string, botId: string): string {
  return content.replace(new RegExp(`<@!?${botId}>`, 'g'), '').trim();
}

export function resolveMentions(message: Message): string {
  return message.content.replace(/<@(\d+)>/g, (match, userId) => {
    const user = message.client.users.cache.get(userId);
    return user ? `@${user.username}` : match;
  });
}
