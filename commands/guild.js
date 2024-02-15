// commands/guild.js
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { prefix, embedColor } = require("../config.js");

module.exports = {
  name: "guild",
  description: "Manage guild-related actions.",
  usage: `${prefix}guild <create|delete|help|invite|kick|leaderboard|list|rename> [arguments]`,
  execute: async (message, args) => {
    if (message.author.bot) return;
    const subCommand = args.shift()?.toLowerCase();

    if (!subCommand) {
      const usageEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`Usage: ${module.exports.usage}`);
      return message.reply({ embeds: [usageEmbed] });
    }

    try {
      const subCommandFile = require(`./guild.subcommands/${subCommand}.js`);
      subCommandFile.execute(message, args);
    } catch (error) {
      console.error(error);
      const invalidSubCommandEmbed = new MessageEmbed()
  .setColor("#ff3838")
  .setDescription(
    `Invalid sub-command for 'guild'. Available sub-commands: create, delete, help, invite, kick, leaderboard, list, rename.`
  );

      message.reply({ embeds: [invalidSubCommandEmbed] });
    }
  },
};