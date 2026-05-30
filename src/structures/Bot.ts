import { Client, LocalAuth, ClientOptions, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { Context } from './Context';

type CommandHandler = (ctx: Context) => Promise<void> | void;
type ErrorHandler = (ctx: Context, error: Error) => Promise<void> | void;
type UnknownCommandHandler = (ctx: Context) => Promise<void> | void;

export interface BotOptions {
    /** The command prefix (e.g., '!', '#') */
    prefix?: string;
    /** whatsapp-web.js client options */
    puppeteerOptions?: ClientOptions;
}

export class Bot {
    public client: Client;
    public prefix: string;
    private commands: Map<string, CommandHandler>;
    private errorHandler?: ErrorHandler;
    private unknownCommandHandler?: UnknownCommandHandler;

    constructor(options: BotOptions = {}) {
        this.prefix = options.prefix || '!';
        this.commands = new Map();

        // Default to LocalAuth to save session without needing constant QR scans
        const defaultOptions: ClientOptions = {
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        };

        const userOptions = options.puppeteerOptions || {};

        this.client = new Client({
            ...defaultOptions,
            ...userOptions,
            puppeteer: {
                ...defaultOptions.puppeteer,
                ...(userOptions.puppeteer || {})
            }
        });

        this.setupEvents();
    }

    /** Register a new command */
    public command(name: string, handler: CommandHandler): this {
        this.commands.set(name.toLowerCase(), handler);
        return this;
    }

    /** Define a custom error handler for when a command throws an error */
    public onCommandError(handler: ErrorHandler): this {
        this.errorHandler = handler;
        return this;
    }

    /** Define a custom handler for when a user types an unknown command */
    public onUnknownCommand(handler: UnknownCommandHandler): this {
        this.unknownCommandHandler = handler;
        return this;
    }

    /** Start the bot and generate QR code */
    public start(): void {
        this.client.initialize();
    }

    /** Listen to whatsapp-web.js events directly with proper typing */
    public get on(): Client['on'] {
        return this.client.on.bind(this.client);
    }

    private setupEvents(): void {
        this.client.on('qr', (qr) => {
            console.log('\nScan this QR code in WhatsApp to log in:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ Bot is online and ready!');
        });

        // Use message_create to capture BOTH incoming and self-sent messages
        this.client.on('message_create', async (msg: Message) => {
            await this.handleMessage(msg);
        });
    }

    private async handleMessage(msg: Message): Promise<void> {
        const text = msg.body || '';

        // Ignore messages that don't start with the prefix
        if (!text.startsWith(this.prefix)) return;

        // Parse command and arguments
        const args = text.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const ctx = new Context(this.client, msg, this.prefix, commandName, args);
        const handler = this.commands.get(commandName);

        if (handler) {
            try {
                await handler(ctx);
            } catch (error) {
                if (this.errorHandler) {
                    await this.errorHandler(ctx, error as Error);
                } else {
                    console.error(`Error executing command ${commandName}:`, error);
                    await ctx.reply('❌ An error occurred while executing that command.');
                }
            }
        } else {
            if (this.unknownCommandHandler) {
                await this.unknownCommandHandler(ctx);
            }
        }
    }
}