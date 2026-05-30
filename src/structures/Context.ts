import { Message, Client, Chat, Contact, MessageMedia } from 'whatsapp-web.js';

export class Context {
    public readonly message: Message;
    public readonly client: Client;
    public readonly prefix: string;
    public readonly commandName: string;
    public readonly args: string[];

    constructor(client: Client, message: Message, prefix: string, commandName: string, args: string[]) {
        this.client = client;
        this.message = message;
        this.prefix = prefix;
        this.commandName = commandName;
        this.args = args;
    }

    /** The raw text of the message */
    get body(): string {
        return this.message.body;
    }

    /** Whether the message was sent by the bot itself */
    get isSelf(): boolean {
        return this.message.fromMe;
    }

    /** Reply directly to the message */
    async reply(content: string | MessageMedia, options?: any): Promise<Message> {
        // whatsapp-web.js requires the chat ID to reply properly, or using the reply method natively
        return this.message.reply(content, this.message.from, options);
    }

    /** Send a standard message to the current chat (without quoting) */
    async send(content: string | MessageMedia, options?: any): Promise<Message> {
        const chat = await this.getChat();
        return chat.sendMessage(content, options);
    }

    /** React to the message with an emoji */
    async react(emoji: string): Promise<void> {
        return this.message.react(emoji);
    }

    /** Get the chat (group or private) where the message was sent */
    async getChat(): Promise<Chat> {
        return this.message.getChat();
    }

    /** Get the contact information of the sender */
    async getAuthor(): Promise<Contact> {
        return this.message.getContact();
    }

    /** Check if the message was sent in a group */
    async isGroup(): Promise<boolean> {
        const chat = await this.getChat();
        return chat.isGroup;
    }
}
