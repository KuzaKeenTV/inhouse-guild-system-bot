// commands/stats.js
const { MessageEmbed } = require("discord.js");
const { prefix, embedColor } = require("../config.js");

module.exports = {
  name: "stats",
  description: "Show overall stats of the bot.",
  usage: `${prefix}stats`,
  execute: async (message, args) => {
    const os = require("os");

      const botUptime = process.uptime();
      const botPing = message.client.ws.ping;
      const systemUptime = os.uptime();
      const botMemoryUsage = process.memoryUsage().rss / 1024 / 1024;
      const systemMemoryUsage = (os.totalmem() - os.freemem()) / 1024 / 1024;
      const Discord = require("discord.js");

      const embed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Wild Rift Guild System Stats")
        .addFields(
          {
            name: "Bot Uptime",
            value: `\`\`\`${Math.floor(botUptime / 3600)}h ${Math.floor(
              (botUptime % 3600) / 60
            )}m ${Math.floor(botUptime % 60)}s\`\`\``,
            inline: true,
          },
          {
            name: "Bot Ping",
            value: `\`\`\`${botPing}ms\`\`\``,
            inline: true,
          },
          {
            name: "System Uptime",
            value: `\`\`\`${Math.floor(systemUptime / 3600)}h ${Math.floor(
              (systemUptime % 3600) / 60
            )}m ${Math.floor(systemUptime % 60)}s\`\`\``,
            inline: true,
          },
          {
            name: "Bot Memory Usage",
            value: `\`\`\`${botMemoryUsage.toFixed(2)} MB\`\`\``,
            inline: true,
          },
          {
            name: "System Memory Usage",
            value: `\`\`\`${systemMemoryUsage.toFixed(2)} MB\`\`\``,
            inline: true,
          },
          {
            name: "Bot Version",
            value: `\`\`\`${Discord.version}\`\`\``,
            inline: true,
          }
        )
        .setFooter({
          text: "Wild Rift In-House ",
          iconURL:
            "https://media.discordapp.net/attachments/987317494039592972/987384673258836068/IN_HOUSE_LOGO.png?width=468&height=468",
        })
        .setTimestamp();

      message.reply({ embeds: [embed] });
  },
};