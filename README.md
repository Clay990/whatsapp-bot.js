# whatsapp-bot.js

[![npm version](https://img.shields.io/npm/v/whatsapp-bot.js.svg)](https://www.npmjs.com/package/whatsapp-bot.js)

A high-level, `discord.py`-inspired framework for building WhatsApp bots easily and quickly. Built on top of `whatsapp-web.js`.

> **⚠️ Disclaimer:** This framework uses the unofficial WhatsApp Web protocol. It is NOT the official Meta WhatsApp API. This framework is intended for personal assistants, hobby projects, home automation, and small community groups. **Do not use this for bulk marketing, spam, or massive enterprise scale.** If you automate too aggressively or send unsolicited messages, WhatsApp WILL ban your phone number without warning. Use at your own risk. We strongly recommend using a secondary phone number for development.

## Features
- **Zero Meta API Setup**: Uses WhatsApp Web under the hood. No business registrations needed.
- **Context Object (`ctx`)**: Just like `discord.py`, a rich context object makes replying, reacting, and fetching chat data trivial.
- **Built-in Command Handler**: Define commands easily without complex `if/else` ladders.
- **Self-Message Support**: Commands work even if *you* send them from your own phone!
- **TypeScript First**: Full autocomplete support.

## Installation

Install the package via npm:

```bash
npm install whatsapp-bot.js qrcode-terminal
```

## Quick Start

```typescript
import { Bot } from 'whatsapp-bot.js';

const bot = new Bot({ prefix: '!' });

bot.command('ping', async (ctx) => {
    await ctx.reply('Pong! 🏓');
});

bot.command('echo', async (ctx) => {
    await ctx.send(ctx.args.join(' '));
});

bot.start();
```

## How to Run

1. Run your script using `ts-node` or by compiling to JS.
2. A QR code will appear in your terminal.
3. Open WhatsApp on your phone -> Linked Devices -> Link a Device.
4. Scan the QR code.
5. Send `!ping` in any chat (or to yourself) and watch the bot reply!
