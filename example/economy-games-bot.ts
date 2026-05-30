import { Bot } from '../src';

const bot = new Bot({ prefix: '!' });

// Simple In-Memory Database (In production, use PostgreSQL, MongoDB, or SQLite)
const db = new Map<string, number>();

function getBalance(userId: string): number {
    return db.get(userId) || 0;
}

function addBalance(userId: string, amount: number) {
    db.set(userId, getBalance(userId) + amount);
}

function removeBalance(userId: string, amount: number) {
    db.set(userId, Math.max(0, getBalance(userId) - amount));
}

bot.on('ready', () => {
    console.log('💰 Economy & Games Bot is online!');
});

// --- ECONOMY COMMANDS ---

bot.command('balance', async (ctx) => {
    const author = await ctx.getAuthor();
    const userId = author.id._serialized;
    const balance = getBalance(userId);
    
    await ctx.reply(`🏦 @${author.id.user}, you have *$${balance}* coins.`, { mentions: [author] });
});

bot.command('work', async (ctx) => {
    const author = await ctx.getAuthor();
    const userId = author.id._serialized;
    
    const earnings = Math.floor(Math.random() * 100) + 50; // Earn between 50 and 150
    addBalance(userId, earnings);
    
    await ctx.reply(`💼 You worked hard and earned *$${earnings}*! New balance: *$${getBalance(userId)}*`);
});

bot.command('pay', async (ctx) => {
    const author = await ctx.getAuthor();
    const senderId = author.id._serialized;
    const mentions = await ctx.message.getMentions();

    if (mentions.length === 0 || ctx.args.length < 2) {
        return await ctx.reply('Usage: !pay @user <amount>');
    }

    const receiver = mentions[0];
    const receiverId = receiver.id._serialized;
    const amount = parseInt(ctx.args[1]);

    if (isNaN(amount) || amount <= 0) return await ctx.reply('Please specify a valid amount.');
    if (getBalance(senderId) < amount) return await ctx.reply('❌ You do not have enough coins.');

    removeBalance(senderId, amount);
    addBalance(receiverId, amount);

    await ctx.reply(`💸 You successfully sent *$${amount}* to @${receiver.id.user}.`, { mentions: [receiver] });
});

// --- GAMES COMMANDS ---

bot.command('coinflip', async (ctx) => {
    const author = await ctx.getAuthor();
    const userId = author.id._serialized;

    if (ctx.args.length < 2) return await ctx.reply('Usage: !coinflip <heads/tails> <bet_amount>');

    const choice = ctx.args[0].toLowerCase();
    const bet = parseInt(ctx.args[1]);

    if (choice !== 'heads' && choice !== 'tails') return await ctx.reply('Choose heads or tails.');
    if (isNaN(bet) || bet <= 0) return await ctx.reply('Invalid bet amount.');
    if (getBalance(userId) < bet) return await ctx.reply('❌ Not enough coins!');

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    if (choice === result) {
        addBalance(userId, bet); // Win
        await ctx.reply(`🪙 The coin landed on *${result}*! You WON *$${bet}*! 🎉\nNew balance: *$${getBalance(userId)}*`);
    } else {
        removeBalance(userId, bet); // Lose
        await ctx.reply(`🪙 The coin landed on *${result}*! You LOST *$${bet}*. 😢\nNew balance: *$${getBalance(userId)}*`);
    }
});

// Simple Blackjack setup (Very simplified)
const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function drawCard() {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    let score = parseInt(value);
    if (['J', 'Q', 'K'].includes(value)) score = 10;
    if (value === 'A') score = 11;
    return { string: `${value}${suit}`, score };
}

bot.command('blackjack', async (ctx) => {
    const playerCard1 = drawCard();
    const playerCard2 = drawCard();
    const dealerCard1 = drawCard();
    const dealerCard2 = drawCard();

    let playerScore = playerCard1.score + playerCard2.score;
    let dealerScore = dealerCard1.score + dealerCard2.score;

    let msg = `🎰 *BLACKJACK* 🎰\n\n`;
    msg += `*Dealer's Hand:* ${dealerCard1.string} ? (${dealerCard1.score})\n`;
    msg += `*Your Hand:* ${playerCard1.string} ${playerCard2.string} (${playerScore})\n\n`;

    if (playerScore === 21) {
        msg += `🎉 *BLACKJACK! You Win!*`;
    } else if (playerScore > dealerScore || dealerScore > 21) {
        msg += `✅ *You Win!* (Dealer had ${dealerScore})`;
    } else if (playerScore === dealerScore) {
        msg += `🤝 *Push! It's a tie.*`;
    } else {
        msg += `❌ *Dealer Wins!* (Dealer had ${dealerScore})`;
    }

    await ctx.reply(msg);
});

bot.start();