import { Bot } from '../src';
import { GoogleGenAI } from '@google/genai';

// IMPORTANT: Make sure to set your GEMINI_API_KEY environment variable
// export GEMINI_API_KEY="your_api_key_here"
const ai = new GoogleGenAI();

const bot = new Bot({ prefix: '!' });

bot.on('ready', () => {
    console.log('🤖 AI Bot is online! Send !ai <message> to chat.');
});

bot.command('ai', async (ctx) => {
    if (ctx.args.length === 0) {
        await ctx.reply('Please provide a prompt! Example: !ai What is the capital of France?');
        return;
    }

    const prompt = ctx.args.join(' ');
    
    // Send a temporary "thinking" message or react
    await ctx.react('🧠');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful, concise WhatsApp assistant. Use bolding and lists appropriately for WhatsApp formatting. Do not use markdown headers (#)."
            }
        });

        if (response.text) {
            await ctx.reply(response.text);
        } else {
            await ctx.reply('Sorry, I could not generate a response.');
        }
    } catch (error) {
        console.error('AI Error:', error);
        await ctx.reply('❌ Failed to connect to the AI. Did you set GEMINI_API_KEY?');
    }
});

// A command to summarize the replied-to message
bot.command('summarize', async (ctx) => {
    if (!ctx.message.hasQuotedMsg) {
        await ctx.reply('Please reply to a long message with !summarize to use this command.');
        return;
    }

    const quotedMsg = await ctx.message.getQuotedMessage();
    if (!quotedMsg.body) {
        await ctx.reply('The quoted message has no text to summarize.');
        return;
    }

    await ctx.react('📝');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please summarize the following text in 1 or 2 short sentences:\n\n${quotedMsg.body}`
        });

        if (response.text) {
            await ctx.reply(`*Summary:*\n${response.text}`);
        }
    } catch (error) {
        await ctx.reply('❌ Failed to summarize.');
    }
});

bot.start();