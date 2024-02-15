// commands/reset.js
const { MessageEmbed } = require("discord.js");
const { prefix, SPREADSHEET_ID, adminRole, embedColor } = require("../config.js");
const getGuildPoints = require("../utils/getGuildPoints.js");
const setGuildPoints = require("../utils/setGuildPoints.js");
const authorize = require("../sheets");

module.exports = {
  name: "reset",
  description: "Reset points for a specified guild or all guilds.",
  usage: `${prefix}reset <@role | all>`,
  execute: async (message, args) => {
    if (message.author.bot) return;
    if (!message.member.roles.cache.some((role) => adminRole.includes(role.id))) {
      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("You do not have permission to use this command.");
      return message.reply({ embeds: [embed] });
    }

    const arg = args[0];
    const mentionedRole = message.mentions.roles.first();

    if (!arg || (arg !== "all" && !mentionedRole)) {
      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`**Usage:** ${module.exports.usage}`);
      return message.reply({ embeds: [embed] });
    }

    try {
      // Send preliminary message indicating that data is being fetched
      const fetchingDataEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Fetching data for the reset...");
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
        console.log("No guild data found.");
        const errorEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("No guild data found in the spreadsheet.");
        return fetchingDataMsg.edit({ embeds: [errorEmbed] });
      }

      // Reset points for all guilds
      if (arg === "all") {
        // Reset points for each guild in the spreadsheet
        for (let index = 1; index < data.values.length; index++) {
          const [, guildRoleID] = data.values[index];
          await setGuildPoints(null, guildRoleID, 0, 0, 0, SPREADSHEET_ID);
        }

        const successEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("All guild points in the spreadsheet have been reset.");
        fetchingDataMsg.edit({ embeds: [successEmbed] });
      } else {
        // Reset points for the specified guild
        if (!mentionedRole) {
          const errorEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setDescription("Please mention a valid role to reset points for.");
          return fetchingDataMsg.edit({ embeds: [errorEmbed] });
        }

        const guildData = data.values.find((row) => row[1] === mentionedRole.id);
        if (!guildData) {
          const errorEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setDescription("Guild not found in the spreadsheet.");
          return fetchingDataMsg.edit({ embeds: [errorEmbed] });
        }

        await setGuildPoints(null, mentionedRole.id, 0, 0, 0, SPREADSHEET_ID);

        const successEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(`Points for ${mentionedRole} have been reset.`);
        fetchingDataMsg.edit({ embeds: [successEmbed] });
      }
    } catch (error) {
      console.error("Error resetting points:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while resetting points.");
      message.reply({ embeds: [errorEmbed] });
    }
  },
};