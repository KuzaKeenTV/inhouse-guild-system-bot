// commands/guild.subcommands/create.js
const { MessageEmbed } = require("discord.js");
const { embedColor, GuildLeaderRoleID, SPREADSHEET_ID } = require("../../config.js");
const authorize = require("../../sheets");
const setGuildPoints = require("../../utils/setGuildPoints");

module.exports = {
  name: "create",
  description: "Create a new guild.",
  execute: async (message, args) => {
    try {
      // Send preliminary message indicating that guild creation is in progress
      const creatingGuildEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Creating a new guild...");

      const creatingGuildMsg = await message.reply({ embeds: [creatingGuildEmbed] });

      // Check if the user has the guild leader role
      if (!message.member.roles.cache.has(GuildLeaderRoleID)) {
        // Send a reply as an embed indicating no permission
        const noPermissionEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You do not have permission to create a guild.");
        return creatingGuildMsg.edit({ embeds: [noPermissionEmbed] });
      }

      // Check if the guild leader already has an existing guild
      const guildLeaderId = message.member.id;

      // Fetch guild data from the spreadsheet
      const sheets = await authorize();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "GUILDS DATABASE!A:E",
      });
      const guildData = response.data.values;
      const existingGuild = guildData.find((row) => row[0] === guildLeaderId);
      if (existingGuild) {
        // User already has a guild
        const existingGuildEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("You already have an existing guild. You can only create one guild.");
        return creatingGuildMsg.edit({ embeds: [existingGuildEmbed] });
      }

      // Continue with guild creation
      const guildName = args.join(" ");
      if (!guildName) {
        const noGuildNameEmbed = new MessageEmbed()
          .setColor(embedColor)
          .setDescription("Please provide a name for the guild.");
        return creatingGuildMsg.edit({ embeds: [noGuildNameEmbed] });
      }

      // Create a role with the name of the guild
      const guildRole = await message.guild.roles.create({
        name: guildName,
        mentionable: true, // Set mentionable to true
      });

      // Give the guild role to the guild leader
      await message.member.roles.add(guildRole);

      // Move the guild role under the specified role
      const parentRole = message.guild.roles.cache.get("937670457610633256"); // Replace with the actual role ID
      if (parentRole) {
        guildRole.setPosition(parentRole.position - 1);
      }

      // Save guild information to the spreadsheet
      await setGuildPoints(guildLeaderId, guildRole.id, 0, 0, 0, SPREADSHEET_ID);

      // Send a reply as an embed
      const successEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`Guild "<@&${guildRole.id}>" created successfully.`);
      return creatingGuildMsg.edit({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error creating guild:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while creating the guild.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};