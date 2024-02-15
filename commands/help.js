// commands/help.js
const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { embedColor, prefix } = require("../config.js");

module.exports = {
  name: "help",
  description: "Display all available commands and their descriptions.",
  usage: `${prefix}help`,
  execute: async (message, args) => {
    try {
      // Fetch all command files
      const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

      // Prepare the help embed
      const helpEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Command List")
        .setDescription("Here are all available commands and their descriptions:")
        .setFooter({
          text: "Wild Rift In-House ",
          iconURL: "https://media.discordapp.net/attachments/987317494039592972/987384673258836068/IN_HOUSE_LOGO.png?width=468&height=468",
        })
        .setTimestamp();

      // Iterate over each command file to extract name, usage, and description
      for (const file of commandFiles) {
        const command = require(`./${file}`);
        if (command.name && command.description && command.usage) {
          helpEmbed.addFields({ name: `${command.usage}`, value: command.description });
        }
      }

      // Send the embed with the commands help
      return message.reply({ embeds: [helpEmbed] });
    } catch (error) {
      console.error("Error displaying help:", error);
      const errorEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription("An error occurred while displaying help.");
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};
