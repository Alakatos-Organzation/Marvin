import { SlashCommand } from "../types";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  MessageReaction,
  SlashCommandBuilder,
} from "discord.js";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("scrim")
    .addStringOption((option) => {
      return option
        .setName("wochentag")
        .setDescription("Tag für die Scrimgames")
        .setRequired(true);
    })
    .addIntegerOption((option) => {
      return option
        .setMaxValue(5)
        .setMinValue(1)
        .setName("gamecount")
        .setDescription("Anzahl an Scrimgames")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("team")
        .setDescription("Gegnerteam für die Scrimgames");
    })
    .setDescription("Scrimtermin ausmachen"),
  execute: async (interaction) => {
    const Day = interaction.options.getString("wochentag");
    const Team = interaction.options.getString("team") ?? "so nen random Team";
    const gameCount = Number(interaction.options.get("gamecount")?.value);
    interaction.reply({
      content: `Passt für jeden ${gameCount} scrimgame(s) ${Day} gegen ${Team}`,
      fetchReply: true,
    });
    const message = await interaction.fetchReply();
    await message.react("👍");
    await message.react("👎");
    const collector = message.createReactionCollector({
      filter: (reaction: MessageReaction) => {
        return reaction.emoji.name === "👍" || reaction.emoji.name === "👎";
      },
      time: 86_400_000,
    });
    collector.on("collect", async (reaction, user) => {
      console.log(`Collected ${reaction.emoji.name}`);
      if (reaction?.emoji.name === "👍" && reaction.count === 2) {
        const guild = interaction.guild
        if (!guild)
          return console.log("Guild not found")
        guild.scheduledEvents.create({
          name: 'teste',
          scheduledStartTime: '2024-01-01T12:00:00+01:00',
          privacyLevel:GuildScheduledEventPrivacyLevel.GuildOnly,
          entityType: GuildScheduledEventEntityType.Voice,
          description: 'This is a test Scheduled Event',
          channel: '1181997423715950674',
          image: null,
          reason: 'Testing with creating a Scheduled Event'
        })
      } else if (reaction?.emoji.name === "👎" && reaction.count === 2) {
        const thread = await message.startThread({
          name: "Neuer Scrim-Termin",
          autoArchiveDuration: 60 * 24 * 3,
        });
        console.log(`Created thread: ${thread.name}`);
        thread.send(`@everyone ${user.username} der Hurensohn kann nicht`);
      }
    });
  },
};

export default command;
