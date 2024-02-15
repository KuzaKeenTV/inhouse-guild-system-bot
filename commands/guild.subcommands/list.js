// commands/guild.subcommands/list.js
const { MessageEmbed } = require("discord.js");
const { embedColor, SPREADSHEET_ID } = require("../../config.js");
const authorize = require("../../sheets");

module.exports = {
  name: "list",
  description: "List all guilds with their leaders and total members.",
  execute: async (message, args) => {
    try {
      // Send preliminary message indicating that guild data is being fetched
      const fetchingGuildDataEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Fetching guild data...");

      const fetchingGuildDataMsg = await message.reply({ embeds: [fetchingGuildDataEmbed] });

      // Fetch all members of the guild
      await message.guild.members.fetch();

      // Authorize and get access to Google Sheets API
      const sheets = await authorize();

      // Fetch data from the spreadsheet
      const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "GUILDS DATABASE!A:E",
      });

      // Check if data is available
      if (!data || !data.values) {
        console.log("No data found.");
        const noDataEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("No guild data found.");
        return fetchingGuildDataMsg.edit({ embeds: [noDataEmbed] });
      }

      // Prepare the list embed
      const guildListEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Guild List")
        .setFooter({
          text: "Wild Rift In-House ",
          iconURL:
            "https://media.discordapp.net/attachments/987317494039592972/987384673258836068/IN_HOUSE_LOGO.png?width=468&height=468",
        })
        .setTimestamp();

      // Iterate over the rows to extract guild information
      for (let index = 1; index < data.values.length; index++) {
        const [guildLeaderID, guildRoleID] = data.values[index];

        // Fetch the guild role
        const guildRole = message.guild.roles.cache.get(guildRoleID);
        const guildName = guildRole ? guildRole.name : "Unknown Guild";

        // Calculate the total number of members in the guild
        const totalMembers = guildRole ? guildRole.members.size : 0;

        // Append guild information to the embed
        guildListEmbed.addFields({
          name: `${index}. ${guildName}`,
          value: `Guild Leader: <@${guildLeaderID}>\nTotal Members: ${totalMembers}`,
          inline: false
        });
      }

      // Edit the preliminary message to show the final guild list embed
      return fetchingGuildDataMsg.edit({ embeds: [guildListEmbed] });
    } catch (error) {
      console.error("Error listing guilds:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while listing guilds.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};