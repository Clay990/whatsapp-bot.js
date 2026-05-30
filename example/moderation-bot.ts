import { Bot } from '../src';

const bot = new Bot({ prefix: '!' });

bot.on('ready', () => {
    console.log('🛡️ Moderation Bot is online!');
});

// Helper to check if a user is an admin
async function isAdmin(ctx: any): Promise<boolean> {
    const chat = await ctx.getChat();
    if (!chat.isGroup) return false;
    
    const contact = await ctx.getAuthor();
    const authorId = contact.id._serialized;
    
    for (let participant of chat.participants) {
        if (participant.id._serialized === authorId && (participant.isAdmin || participant.isSuperAdmin)) {
            return true;
        }
    }
    return false;
}

// 1. Kick a user
bot.command('kick', async (ctx) => {
    const isGroup = await ctx.isGroup();
    if (!isGroup) return await ctx.reply('This command can only be used in a group.');

    if (!(await isAdmin(ctx))) {
        return await ctx.reply('❌ You must be a group admin to use this command.');
    }

    const chat = await ctx.getChat();
    const mentions = await ctx.message.getMentions();

    if (mentions.length === 0) {
        return await ctx.reply('Please mention the user you want to kick. Example: !kick @user');
    }

    const userToKick = mentions[0];
    
    try {
        await chat.removeParticipants([userToKick.id._serialized]);
        await ctx.reply(`✅ Successfully removed @${userToKick.id.user} from the group.`, { mentions: [userToKick] });
    } catch (error) {
        await ctx.reply('❌ Failed to kick user. Make sure I am an admin!');
    }
});

// 2. Mention Everyone (Tag All)
bot.command('everyone', async (ctx) => {
    const isGroup = await ctx.isGroup();
    if (!isGroup) return await ctx.reply('This command can only be used in a group.');

    if (!(await isAdmin(ctx))) {
        return await ctx.reply('❌ You must be an admin to tag everyone.');
    }

    const chat = await ctx.getChat();
    
    let text = "📣 *ANNOUNCEMENT*\n\n";
    if (ctx.args.length > 0) {
        text += ctx.args.join(' ') + "\n\n";
    }

    const mentions = [];
    for (let participant of chat.participants) {
        mentions.push(participant.id._serialized);
        text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
});

// 3. Purge (Clear messages) - Note: WhatsApp only allows deleting messages sent by the bot or deleting for "Me". 
// To delete for everyone, the bot must be an admin and the message must be recent.
bot.command('del', async (ctx) => {
    if (!ctx.message.hasQuotedMsg) {
        return await ctx.reply('Reply to a message with !del to delete it.');
    }

    const quotedMsg = await ctx.message.getQuotedMessage();
    try {
        await quotedMsg.delete(true); // true = delete for everyone
        await ctx.react('✅');
    } catch (error) {
        await ctx.reply('❌ Cannot delete this message. I might not be an admin, or the message is too old.');
    }
});

// Welcome New Users Automatically
bot.on('group_join', async (notification) => {
    try {
        const chat = await notification.getChat();
        const contactIds = notification.recipientIds;
        
        for (let id of contactIds) {
            await chat.sendMessage(`Welcome to the group, @${id.split('@')[0]}! 🎉`, {
                mentions: [id]
            });
        }
    } catch (error) {
        console.error('Error in welcome message:', error);
    }
});

bot.start();