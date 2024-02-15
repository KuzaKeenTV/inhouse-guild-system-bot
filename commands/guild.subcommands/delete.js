// commands/guild.subcommands/delete.js
const { MessageEmbed } = require("discord.js");
const { embedColor, GuildLeaderRoleID, SPREADSHEET_ID } = require("../../config.js");
const authorize = require("../../sheets");
const deleteGuildData = require("../../utils/deleteGuildData");

module.exports = {
  name: "delete",
  description: "Delete the guild.",
  execute: async (message, args) => {
    try {
      // Check if the user has the guild leader role
      if (!message.member.roles.cache.has(GuildLeaderRoleID)) {
        // Send a reply as an embed indicating no permission
        const noPermissionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have permission to delete the guild.");
        return message.reply({ embeds: [noPermissionEmbed] });
      }

      // Check if the guild leader already has an existing guild
      const guildLeaderId = message.author.id;

      // Fetch guild data from the spreadsheet
      const sheets = await authorize();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "GUILDS DATABASE!A:E",
      });
      const guildData = response.data.values;
      const existingGuild = guildData.find((row) => row[0] === guildLeaderId);
      if (!existingGuild) {
        // User does not have a guild
        const noGuildEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You don't have an existing guild to delete.");
        return message.reply({ embeds: [noGuildEmbed] });
      }

      // Confirm deletion with the user
      const confirmEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Are you sure you want to delete the guild? This action cannot be undone.")
        .setFooter("Type 'confirm' to proceed or 'cancel' to cancel the operation.");
      const confirmMessage = await message.reply({ embeds: [confirmEmbed] });

      // Await user confirmation
      const filter = (response) => response.author.id === message.author.id;
      const userResponse = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] }).catch(() => {});

      if (!userResponse || !userResponse.size) {
        // Handle timeout error
        const timeoutEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Timeout. Guild deletion cancelled.");
        return confirmMessage.edit({ embeds: [timeoutEmbed] });
      }

      const responseContent = userResponse.first().content.trim().toLowerCase();

      // Handle user response
      if (responseContent === "confirm") {
        // Proceed with guild deletion
        const guildRoleId = existingGuild[1]; // Assuming guildRoleId is stored in the second column
        // Delete the guild role from the server
        const guildRole = message.guild.roles.cache.get(guildRoleId);
        if (guildRole) {
          await guildRole.delete();
        }

        // Remove guild data from the spreadsheet
        await deleteGuildData(guildRoleId);

        // Send a reply as an embed indicating successful deletion
        const deletionSuccessEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("The guild has been successfully deleted.");
        return message.channel.send({ embeds: [deletionSuccessEmbed] });
      } else if (responseContent === "cancel") {
        // Cancel deletion
        const cancellationEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Guild deletion has been cancelled.");
        return confirmMessage.edit({ embeds: [cancellationEmbed] });
      } else {
        // Invalid response
        const invalidResponseEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Invalid response. Guild deletion cancelled.");
        return confirmMessage.edit({ embeds: [invalidResponseEmbed] });
      }
    } catch (error) {
      console.error("Error deleting guild:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while deleting the guild.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};