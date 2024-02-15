// commands/guild.subcommands/rename.js
const { MessageEmbed } = require("discord.js");
const { embedColor, GuildLeaderRoleID, SPREADSHEET_ID } = require("../../config.js");
const fetchGuildData = require("../../utils/fetchGuildData");

module.exports = {
  name: "rename",
  description: "Rename a guild.",
  execute: async (message, args) => {
    try {
      // Check if the user has the guild leader role
      if (!message.member.roles.cache.has(GuildLeaderRoleID)) {
        // Send a reply as an embed indicating no permission
        const noPermissionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have permission to rename guilds.");
        return message.reply({ embeds: [noPermissionEmbed] });
      }

      // Extract new name from the command arguments
      const newName = args.join(" ");

      // Check if new name is provided
      if (!newName) {
        const noNameEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Please provide the new name for the guild.");
        return message.reply({ embeds: [noNameEmbed] });
      }

      // Fetch guild data to get the guild role ID
      const { guildRoleId } = await fetchGuildData(message.member.id, SPREADSHEET_ID);

      // Check if the guild role ID is available
      if (!guildRoleId) {
        const noGuildEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have an existing guild to rename.");
        return message.reply({ embeds: [noGuildEmbed] });
      }

      // Fetch the guild role from the server
      const guildRole = message.guild.roles.cache.get(guildRoleId);

      // Check if the guild role exists
      if (!guildRole) {
        const roleNotFoundEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Guild role not found.");
        return message.reply({ embeds: [roleNotFoundEmbed] });
      }

      // Store the old name before renaming
      const oldName = guildRole.name;

      // Check if the new name is different from the current name
      if (newName === oldName) {
        const sameNameEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("The new name is the same as the current name of the guild.");
        return message.reply({ embeds: [sameNameEmbed] });
      }

      // Rename the guild role
      await guildRole.setName(newName);

      // Send a success message
      const successEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`Guild role "${oldName}" renamed to "${newName}" successfully.`);
      return message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error renaming guild role:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while renaming the guild role.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};
