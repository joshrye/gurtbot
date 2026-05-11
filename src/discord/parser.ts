import type { Message } from 'discord.js';
import type { BotIdentity, Turn } from '../types.ts';
import {
  buildChannelContext,
  buildReplyChain,
  buildRepliedMsgContext,
} from './contextbuilder.ts';
import { stripMention } from './format.ts';

export async function parseMessage(message: Message, bot: BotIdentity): Promise<Turn[] | null> {
  const mentionedTo = message.mentions.users.has(bot.id);
  const repliedTo = await (async () => {
    const ref = message.reference?.messageId
      ? await message.fetchReference().catch(() => null)
      : null;
    return ref
      ? { type: ref.author.id === bot.id ? 'bot' : 'user', message: ref }
      : { type: null, message: null };
  })();

  if (!mentionedTo && repliedTo.type !== 'bot') return null;
  if (!stripMention(message.content, bot.id)) return null;
  if (repliedTo.type === 'bot') return buildReplyChain(message, bot, repliedTo.message);
  if (repliedTo.type === 'user') return buildRepliedMsgContext(message, repliedTo.message, bot);
  return buildChannelContext(message, bot);
}
