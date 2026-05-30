export { Bot, BotOptions } from './structures/Bot';
export { Context } from './structures/Context';

// Export useful whatsapp-web.js types and classes so users don't need to install it directly
export { 
    Client, 
    Message, 
    MessageMedia, 
    Location, 
    Buttons, 
    List, 
    Chat, 
    Contact,
    ClientOptions,
    LocalAuth
} from 'whatsapp-web.js';

import * as WhatsApp from 'whatsapp-web.js';
export { WhatsApp };