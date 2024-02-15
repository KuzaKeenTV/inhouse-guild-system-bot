// commands/guild.subcommands/kick.js
const { MessageEmbed } = require("discord.js");
const { embedColor, GuildLeaderRoleID, SPREADSHEET_ID } = require("../../config.js");
const fetchGuildData = require("../../utils/fetchGuildData");

module.exports = {
  name: "kick",
  description: "Kick a user from the guild.",
  execute: async (message, args) => {
    try {
      // Check if the user has the guild leader role
      if (!message.member.roles.cache.has(GuildLeaderRoleID)) {
        // Send a reply as an embed indicating no permission
        const noPermissionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have permission to kick users from the guild.");
        return message.reply({ embeds: [noPermissionEmbed] });
      }

      // Check if any user was mentioned
      if (!message.mentions.users.size) {
        // Send a reply as an embed indicating that no user was mentioned
        const noUserMentionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Please mention one or more users to kick from the guild.");
        return message.reply({ embeds: [noUserMentionEmbed] });
      }

      // Fetch guild data from the spreadsheet using the fetchGuildData function
      const { guildRoleId } = await fetchGuildData(message.member.id, SPREADSHEET_ID);

      if (!guildRoleId) {
        // Send a reply as an embed indicating that the guild leader doesn't have a guild
        const noGuildEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            "You need to create a guild first before kicking users."
          );
        return message.reply({ embeds: [noGuildEmbed] });
      }

      // Array to store the users who had their guild roles removed
      const removedUsers = [];

      // Loop through each mentioned user and remove the guild role
      for (const user of message.mentions.users.values()) {
        // Find the mentioned user's member object
        const mentionedMember = message.guild.members.cache.get(user.id);

        if (mentionedMember) {
          // Check if the mentioned user has the guild role
          if (mentionedMember.roles.cache.has(guildRoleId)) {
            // Remove the guild role from the mentioned user
            await mentionedMember.roles.remove(guildRoleId);
            removedUsers.push(user);
          }
        }
      }

      // Send a reply as an embed indicating successful removal of guild roles
      if (removedUsers.length > 0) {
        const removalSuccessEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            `The guild roles have been removed from the following users: ${removedUsers.map(user => `<@${user.id}>`).join(', ')}`
          );
        return message.reply({ embeds: [removalSuccessEmbed] });
      } else {
        const noRemovedUsersEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            "None of the mentioned users had their guild roles removed."
          );
        return message.reply({ embeds: [noRemovedUsersEmbed] });
      }
    } catch (error) {
      console.error("Error removing guild roles from users:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while removing guild roles from users.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};