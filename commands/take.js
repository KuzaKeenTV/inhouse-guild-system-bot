// commands/take.js
const { MessageEmbed } = require("discord.js");
const { prefix, SPREADSHEET_ID, adminRole, embedColor } = require("../config.js");
const getGuildPoints = require("../utils/getGuildPoints.js");
const setGuildPoints = require("../utils/setGuildPoints.js");

module.exports = {
  name: "take",
  description: "Take points from a specified role.",
  usage: `${prefix}take @role <TEAM A/TEAM B> <amount>`,
  execute: async (message, args) => {
    if (message.author.bot) return;
    if (!message.member.roles.cache.some((role) => adminRole.includes(role.id))) {
      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("You do not have permission to use this command.");
      return message.reply({ embeds: [embed] });
    }

    const mentionedRole = message.mentions.roles.first();
    let type = args[args.length - 2]?.toLowerCase();
    if (type === "a") type = "team a";
    else if (type === "b") type = "team b";

    const amount = parseInt(args[args.length - 1]);

    if (!mentionedRole || !type || !amount) {
      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`**Usage:** ${module.exports.usage}`);
      return message.reply({ embeds: [embed] });
    }

    // Send preliminary message indicating that data is being updated
    const updatingPointsEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setDescription("Updating guild points...");

    const updatingPointsMsg = await message.reply({ embeds: [updatingPointsEmbed] });

    // Pass the mentioned role ID (Snowflake) as the guildRoleID parameter
    const currentPoints = await getGuildPoints(mentionedRole.id, SPREADSHEET_ID);
    if (type === "team a") {
      currentPoints.teamAPoints -= amount;
      currentPoints.totalPoints -= amount;
    } else if (type === "team b") {
      currentPoints.teamBPoints -= amount;
      currentPoints.totalPoints -= amount;
    } else {
      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("Invalid point type. Please use TEAM A or TEAM B.");
      return updatingPointsMsg.edit({ embeds: [embed] });
    }

    // Update the points in the spreadsheet
    await setGuildPoints(
      message.author.id,
      mentionedRole.id,
      currentPoints.teamAPoints, 
      currentPoints.teamBPoints,
      currentPoints.totalPoints, 
      SPREADSHEET_ID
    );

    // Edit the preliminary message to show the final result
    const resultEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setDescription(`Removed **${amount} point(s)** from ${type.toUpperCase()} of ${mentionedRole}. They now have **${currentPoints.totalPoints} point(s)**.`);

    return updatingPointsMsg.edit({ embeds: [resultEmbed] });
  },
};
