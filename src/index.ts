import { Client, ClientUser, Events, GatewayIntentBits, Partials, type Message } from 'discord.js';
import { DISCORD_TOKEN } from './config.ts';
import { parseMessage } from './discord/parser.ts';
import { askllm } from './askllm.ts';
import type { BotIdentity, Turn } from './types.ts';
import { readFile } from 'fs/promises';
import { join } from 'path';

const systemPromptPath = join(import.meta.dirname, '..', 'SYSTEM-PROMPT.md');
const systemPromptTemplate = await readFile(systemPromptPath, 'utf8')
  .then(s => s.trim())
  .catch(() => '');

function getSystemPrompt(botUser: ClientUser): string {
  return systemPromptTemplate
    .replaceAll('$username', botUser.username)
    .replaceAll('$userId', `@${botUser.username}`);
}

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

discord.once(Events.ClientReady, (client) => console.log(`Logged in as ${client.user.tag}`));

discord.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.inGuild()) return;
  const botUser = discord.user;
  if (!botUser) return;
  const bot: BotIdentity = { id: botUser.id, name: botUser.username };
  const turns = await parseMessage(message, bot);
  // console.log(turns)
  if (!turns) return;
  await handleAsk(message, turns);
});

await discord.login(DISCORD_TOKEN);

async function handleAsk(message: Message, turns: Turn[]): Promise<void> {
  const typing = setInterval(() => void sendTyping(message), 8_000);
  try {
    await sendTyping(message);
    const botUser = discord.user;
    if (!botUser) throw new Error('Bot user not available');
    const systemInstruction = getSystemPrompt(botUser);
    // console.log(systemInstruction)
    const answer = await askllm(turns, systemInstruction);
    await message.reply(answer);
  } catch (err) {
    console.error(err);
    await message.reply('I hit an error while generating a response.');
  } finally {
    clearInterval(typing);
  }
}

async function sendTyping(message: Message): Promise<void> {
  if ('sendTyping' in message.channel) {
    await message.channel.sendTyping().catch(() => undefined);
  }
}
