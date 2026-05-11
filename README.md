# gurtbot

A small Discord chat bot powered by Google's Gemini API. It listens for mentions and reply threads, builds a compact conversation context from Discord messages, and responds with an LLM-generated answer.

## Features

- Responds when mentioned in a server message.
- Continues conversations when users reply to its messages.
- Builds context from recent channel history, reply chains, or messages near a replied-to message.

## Requirements

- [Bun](https://bun.sh/)
- A Discord application with a bot token
- A Google Gemini API key

The Discord bot needs priviledged gateway intent "Message Content Intent" to be enabled

Recommended Bot Permission:
- View Channels
- Send Messages
- Send Messages in Threads
- Read Message History

## Setup

Install dependencies:

```bash
bun install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the required values:

```env
DISCORD_TOKEN=your_discord_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemma-4-26b-a4b-it
```

`GEMINI_MODEL` is optional. If it's not set, the bot defaults to the recommended `gemma-4-26b-a4b-it`.

## Running

Start the bot:

```bash
bun run start
```

If login succeeds, the process prints the Discord account it logged in as.

## License

ISC. See [LICENSE](LICENSE).
