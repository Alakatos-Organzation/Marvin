import { SlashCommand } from "../types";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  MessageReaction,
  SlashCommandBuilder,
} from "discord.js";

function parseDateTime(dateString: string, timeString: string): Date {
  const [day, month] = dateString.split('.').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);

  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, day, hour, minute);

  return date;
}

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("scrim")
    .addStringOption((option) => {
      return option
        .setName("datum")
        .setDescription("Datum für die Scrimgames in der Form dd.MM")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("uhrzeit")
        .setDescription("Uhrzeit für die Scrimgames in der Form hh:mm")
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
    const Day = interaction.options.getString("datum");
    const Time = interaction.options.getString("uhrzeit");
    const Team = interaction.options.getString("team") ?? "so nen random Team";
    const gameCount = Number(interaction.options.get("gamecount")?.value);
    const startDate = parseDateTime(Day!, Time!)
    interaction.reply({
      content: `Passt für jeden ${gameCount} Scrimgame(s) am ${Day} um ${Time} Uhr gegen ${Team}`,
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
      if (reaction?.emoji.name === "👍" && reaction.count === 2) { /* Muss für tatsächlichen Use-Case auf 6 gesetzt werden */
        const guild = interaction.guild
        if (!guild)
          return console.log("Guild not found")
        guild.scheduledEvents.create({
          name: 'Scrim',
          scheduledStartTime: startDate.toISOString(),
          privacyLevel:GuildScheduledEventPrivacyLevel.GuildOnly,
          entityType: GuildScheduledEventEntityType.Voice,
          description: 'Scrimtermin',
          channel: '1181997423715950674', /* 1170421452483342417 ist die Kanal-ID für tatsächlichen Use-Case */
          image: null,
          reason: 'Ein neuer Scrimtermin wurde festgelegt'
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
