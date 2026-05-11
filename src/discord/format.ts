import type { Message } from 'discord.js';
import type { BotIdentity, Turn } from '../types.ts';

export function asTurn(message: Message, bot: BotIdentity): Turn {
  const isBotMsg = message.author.id === bot.id;
  const name = message.member?.displayName ?? message.author.displayName;
  const text = replaceBotMention(message.content, bot);

  return {
    role: isBotMsg ? 'model' : 'user',
    text: isBotMsg ? text : `[${name}]: ${text}`,
  };
}

export function stripMention(content: string, botId: string): string {
  return content.replace(new RegExp(`<@!?${botId}>`, 'g'), '').trim();
}

function replaceBotMention(content: string, bot: BotIdentity): string {
  return content.replace(new RegExp(`<@!?${bot.id}>`, 'g'), `@${bot.name}`);
}
