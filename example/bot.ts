import { Bot } from '../src';

// Initialize the bot with a prefix
const bot = new Bot({ prefix: '!' });

// Listen for standard events if needed
bot.on('ready', () => {
    console.log('My Custom Bot is ready to receive messages!');
});

// A simple ping command
bot.command('ping', async (ctx) => {
    await ctx.reply('Pong! 🏓');
});

// A command that says hello and mentions the user
bot.command('hello', async (ctx) => {
    const contact = await ctx.getAuthor();
    await ctx.reply(`Hello, @${contact.id.user}! 👋`, { mentions: [contact] });
});

// An echo command that repeats what the user says
bot.command('echo', async (ctx) => {
    if (ctx.args.length === 0) {
        await ctx.reply('You need to provide something to echo!');
        return;
    }
    
    // ctx.args contains everything after the command
    const text = ctx.args.join(' ');
    await ctx.send(text);
});

// Start the bot (this will print the QR code to terminal)
bot.start();
