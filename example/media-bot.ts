import { Bot, MessageMedia } from '../src';
import play from 'play-dl';
import youtubedl from 'youtube-dl-exec';
import * as fs from 'fs';
import * as path from 'path';

const bot = new Bot({ prefix: '!' });

bot.on('ready', () => {
    console.log('🎵 Media Downloader Bot is online!');
});

// 1. YouTube/SoundCloud Audio Downloader
bot.command('play', async (ctx) => {
    if (ctx.args.length === 0) {
        return await ctx.reply('Please provide a song name! Example: !play shape of you');
    }

    const query = ctx.args.join(' ');
    await ctx.reply(`🔍 Searching for *${query}*...`);

    try {
        // Search on YouTube
        const ytInfo = await play.search(query, { limit: 1, source: { youtube: 'video' } });
        if (!ytInfo || ytInfo.length === 0) {
            return await ctx.reply('❌ No results found.');
        }

        const video = ytInfo[0];
        await ctx.reply(`⏳ Downloading audio from: *${video.title}*...`);

        // Search SoundCloud for the exact title to bypass YouTube bot protections
        const scInfo = await play.search(video.title as string, { limit: 1, source: { soundcloud: 'tracks' } });
        
        if (!scInfo || scInfo.length === 0) {
            return await ctx.reply('❌ Could not find a downloadable stream for this track.');
        }

        const track = scInfo[0];
        const stream = await play.stream(track.url);

        // Convert stream to buffer
        const chunks: any[] = [];
        stream.stream.on('data', (chunk) => chunks.push(chunk));
        
        stream.stream.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            const base64Data = buffer.toString('base64');
            
            const media = new MessageMedia('audio/mpeg', base64Data, 'audio.mp3');
            await ctx.send(media, { sendAudioAsVoice: true });
        });

    } catch (error: any) {
        console.error(error);
        await ctx.reply('❌ Error downloading the song.');
    }
});

// 2. Instagram Video Downloader
bot.command('insta', async (ctx) => {
    if (ctx.args.length === 0 || !ctx.args[0].includes('instagram.com')) {
        return await ctx.reply('Please provide a valid Instagram Reel/Video URL.');
    }

    const url = ctx.args[0];
    await ctx.react('⏳');

    const tempPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);

    try {
        await youtubedl(url, {
            output: tempPath,
            format: 'best',
        });

        const videoBuffer = fs.readFileSync(tempPath);
        const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), 'insta.mp4');
        
        await ctx.send(media);
        await ctx.react('✅');

    } catch (error) {
        console.error(error);
        await ctx.reply('❌ Failed to download Instagram video. It might be private.');
    } finally {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath); // Clean up
        }
    }
});

bot.start();