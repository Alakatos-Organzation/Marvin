import { Client, GatewayIntentBits, Collection, ActivityType } from "discord.js";
const { Guilds, MessageContent, GuildMessages, GuildMembers, GuildMessageReactions, GuildVoiceStates } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, MessageContent, GuildMessages, GuildMembers, GuildMessageReactions, GuildVoiceStates] });
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { promises as fsPromises } from "node:fs";
import { join } from "node:path";
config();

client.slashCommands = new Collection<string, SlashCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();

const handlersDirectory = join(__dirname, "./handlers");

async function loadHandlers() {
    const handlers = await fsPromises.readdir(handlersDirectory);
    await Promise.all(handlers.map(async handler => {
        if (handler.endsWith(".js")) {
            const handlerPath = join(handlersDirectory, handler);
            const importedHandler = await import(handlerPath);
            importedHandler.default(client);
        }
    }));
}

client.on('ready', () => {
    if (client.user) {
        client.user.setActivity({
            name: `zu wie deine Mom gerailed wird`, 
            type: ActivityType.Watching 
        });
    }
});

loadHandlers().then(() => {
    client.login(process.env.TOKEN);
}).catch(error => {
    console.error("Handler loading error:", error);
});