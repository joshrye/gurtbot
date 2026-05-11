import type { Message } from 'discord.js';
import { CHANNEL_CTX_SIZE, REPLIED_MSG_CTX_RADIUS, MIN_REPLY_CHAIN_LENGTH, MAX_REPLY_CHAIN_LENGTH } from '../config.ts';
import type { Turn } from '../types.ts';
import { asTurn } from './format.ts';

/**
 * Walk upward through reply references to reconstruct a multi-turn
 * conversation, capped at MAX_REPLY_CHAIN_LENGTH.
 * If the chain is shorter than MIN_REPLY_CHAIN_LENGTH, prepend enough
 * channel history before the root to bring the total up to the minimum.
 */
export async function buildReplyChain(
  message: Message,
  botId: string,
  firstReference: Message | null = null,
): Promise<Turn[]> {
  const chain: Message[] = [];
  let current: Message | null = message;

  while (current && chain.length < MAX_REPLY_CHAIN_LENGTH) {
    chain.push(current);
    if (current === message && firstReference) {
      current = firstReference;
    } else {
      current = current.reference?.messageId
        ? await current.fetchReference().catch(() => null)
        : null;
    }
  }

  chain.reverse();
  const root = chain[0] ?? message;

  const historyNeeded = Math.max(0, MIN_REPLY_CHAIN_LENGTH - chain.length);
  const history = historyNeeded > 0
    ? await fetchChannelHistory(root, botId, historyNeeded)
    : [];

  return [...history, ...chain.map(m => asTurn(m, botId))];
}

/**
 * When the user mentions the bot while replying to someone else, gather nearby
 * messages around the referenced message, compensating before/after limits so
 * the total stays as close to the desired snippet size as possible.
 */
export async function buildRepliedMsgContext(
  trigger: Message,
  target: Message,
  botId: string,
): Promise<Turn[]> {
  const ch = trigger.channel;
  if (!('messages' in ch)) return [asTurn(trigger, botId)];

  const after = await ch.messages.fetch({ after: target.id, limit: REPLIED_MSG_CTX_RADIUS });
  const beforeLimit = REPLIED_MSG_CTX_RADIUS + (REPLIED_MSG_CTX_RADIUS - after.size);
  const before = await ch.messages.fetch({ before: target.id, limit: beforeLimit });

  const seen = new Set<string>();
  const messages = [
    ...before.values(),
    target,
    ...after.values(),
    trigger,
  ].filter(m => !seen.has(m.id) && seen.add(m.id));

  return toTurns(messages, botId);
}

export async function buildChannelContext(message: Message, botId: string): Promise<Turn[]> {
  const history = await fetchChannelHistory(message, botId);
  return [...history, asTurn(message, botId)];
}

async function fetchChannelHistory(
  anchor: Message,
  botId: string,
  limit = CHANNEL_CTX_SIZE,
): Promise<Turn[]> {
  const ch = anchor.channel;
  if (!('messages' in ch)) return [];
  const fetched = await ch.messages.fetch({ before: anchor.id, limit });
  return toTurns([...fetched.values()], botId);
}

function toTurns(messages: Message[], botId: string): Turn[] {
  return messages
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map(m => asTurn(m, botId));
}
