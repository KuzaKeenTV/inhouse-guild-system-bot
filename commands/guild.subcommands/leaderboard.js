// commands/guild.subcommands/leaderboard.js
const { MessageEmbed } = require("discord.js");
const { embedColor, SPREADSHEET_ID } = require("../../config.js");
const getGuildPoints = require("../../utils/getGuildPoints");
const authorize = require("../../sheets");

module.exports = {
  name: "leaderboard",
  description: "Display the leaderboard for guilds based on their points.",
  execute: async (message, args) => {
    try {
      // Send preliminary message indicating that data is being fetched
      const fetchingDataEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Fetching data for the leaderboard...");
      const fetchingDataMsg = await message.reply({ embeds: [fetchingDataEmbed] });

      // Authorize with Google Sheets
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
        return fetchingDataMsg.edit({ embeds: [noDataEmbed] });
      }

      // Prepare the leaderboard embed
      const leaderboardEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Guild Leaderboard")
        .setDescription("Here is the leaderboard for guilds based on their points:")
        .setFooter({
          text: "Wild Rift In-House ",
          iconURL:
            "https://media.discordapp.net/attachments/987317494039592972/987384673258836068/IN_HOUSE_LOGO.png?width=468&height=468",
        })
        .setTimestamp();

      // Sort guilds based on total points
      const guilds = [];
      for (let index = 1; index < data.values.length; index++) {
        const [guildLeaderID, guildRoleID] = data.values[index];
        const { teamAPoints, teamBPoints, totalPoints } = await getGuildPoints(guildRoleID, SPREADSHEET_ID);
        const guildRole = message.guild.roles.cache.get(guildRoleID);
        const guildName = guildRole ? guildRole.name : "Unknown Guild";
        guilds.push({ guildName, teamAPoints, teamBPoints, totalPoints });
      }
      guilds.sort((a, b) => b.totalPoints - a.totalPoints); // Sort in descending order

      // Add guilds to the leaderboard embed
      guilds.forEach((guild, index) => {
        leaderboardEmbed.addFields({
          name: `${index + 1}. ${guild.guildName}`,
          value: `Team A Points:\` ${guild.teamAPoints} \` Team B Points:\` ${guild.teamBPoints} \` Total Points:\` ${guild.totalPoints} \``,
          inline: false
        });
      });

      // Edit the preliminary message to show the final leaderboard embed
      return fetchingDataMsg.edit({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Error displaying leaderboard:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while displaying the leaderboard.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};