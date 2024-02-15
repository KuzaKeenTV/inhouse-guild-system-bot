// commands/guild.subcommands/invite.js
const { MessageEmbed } = require("discord.js");
const { embedColor, GuildLeaderRoleID, SPREADSHEET_ID } = require("../../config.js");
const fetchGuildData = require("../../utils/fetchGuildData");

module.exports = {
  name: "invite",
  description: "Invite one or more users to the guild.",
  execute: async (message, args) => {
    try {
      // Check if the user has the guild leader role
      if (!message.member.roles.cache.has(GuildLeaderRoleID)) {
        // Send a reply as an embed indicating no permission
        const noPermissionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have permission to invite users to the guild.");
        return message.reply({ embeds: [noPermissionEmbed] });
      }

      // Check if any user was mentioned
      if (!message.mentions.users.size) {
        // Send a reply as an embed indicating that no user was mentioned
        const noUserMentionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Please mention one or more users to invite.");
        return message.reply({ embeds: [noUserMentionEmbed] });
      }

      // Fetch guild data from the spreadsheet using the fetchGuildData function
      const { guildRoleId } = await fetchGuildData(message.member.id, SPREADSHEET_ID);

      if (!guildRoleId) {
        // Send a reply as an embed indicating that the guild leader doesn't have a guild
        const noGuildEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            "You need to create a guild first before inviting user/s."
          );
        return message.reply({ embeds: [noGuildEmbed] });
      }

      // Array to store the users who were successfully invited
      const invitedUsers = [];

      // Loop through each mentioned user and invite them to the guild
      for (const user of message.mentions.users.values()) {
        // Find the mentioned user
        const mentionedMember = message.guild.members.cache.get(user.id);

        if (mentionedMember) {
          // Check if the mentioned user already has a guild role
          const mentionedUserRoles = mentionedMember.roles.cache;

          if (!mentionedUserRoles.some((role) => role.id === guildRoleId)) {
            // Add the guild role created by the guild leader to the mentioned user
            await mentionedMember.roles.add(guildRoleId);
            invitedUsers.push(user);
          }
        }
      }

      // Send a reply as an embed indicating successful invites
      if (invitedUsers.length > 0) {
        const inviteSuccessEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            `The following users have been invited to the guild: ${invitedUsers.map(user => `<@${user.id}>`).join(', ')}`
          );
        return message.reply({ embeds: [inviteSuccessEmbed] });
      } else {
        const noInvitedUsersEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription(
            "None of the mentioned users could be invited to the guild. They might already be in the guild."
          );
        return message.reply({ embeds: [noInvitedUsersEmbed] });
      }
    } catch (error) {
      console.error("Error inviting users to guild:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while inviting the users to the guild.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};