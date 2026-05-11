import type { Message } from 'discord.js';
import type { Turn } from '../types.ts';
import {
  buildChannelContext,
  buildReplyChain,
  buildRepliedMsgContext,
} from './contextbuilder.ts';
import { stripMention } from './format.ts';

export async function parseMessage(message: Message, botId: string): Promise<Turn[] | null> {
  const mentionedTo = message.mentions.users.has(botId);
  const repliedTo = await (async () => {
    const ref = message.reference?.messageId
      ? await message.fetchReference().catch(() => null)
      : null;
    return ref
      ? { type: ref.author.id === botId ? 'bot' : 'user', message: ref }
      : { type: null, message: null };
  })();

  if (!mentionedTo && repliedTo.type !== 'bot') return null;
  if (!stripMention(message.content, botId)) return null;
  if (repliedTo.type === 'bot') return buildReplyChain(message, botId, repliedTo.message);
  if (repliedTo.type === 'user') return buildRepliedMsgContext(message, repliedTo.message, botId);
  return buildChannelContext(message, botId);
}
