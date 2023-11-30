import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

const command : Command = {
    name: "greet",
    execute: (message) => {
        const toGreet = message.mentions.members?.first()
        message.channel.send(`Hi kek ${toGreet ? toGreet.user.username : message.member?.user.username}!`)
    },
    cooldown: 10,
    aliases: ["sayhello"],
    permissions: ["Administrator", PermissionFlagsBits.ManageEmojisAndStickers] // to test
}

export default command