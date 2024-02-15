// commands/guild.subcommands/help.js
const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { embedColor } = require("../../config.js");

module.exports = {
  name: "help",
  description: "Display all available subcommands and their descriptions.",
  execute: async (message, args) => {
    try {
      // Fetch all subcommand files from the guild.subcommands folder
      const subcommandFiles = fs.readdirSync("./commands/guild.subcommands").filter(file => file.endsWith(".js"));

      // Prepare the help embed
      const helpEmbed = new MessageEmbed()
        .setColor(embedColor)
        .setTitle("Guild Subcommands Help")
        .setDescription("Here are all available subcommands and their descriptions:")
        .setFooter({
            text: "Wild Rift In-House ",
            iconURL:
              "https://media.discordapp.net/attachments/987317494039592972/987384673258836068/IN_HOUSE_LOGO.png?width=468&height=468",
          })
          .setTimestamp();

      // Iterate over each subcommand file to extract name and description
      subcommandFiles.forEach(file => {
        const subcommand = require(`../../commands/guild.subcommands/${file}`);
        helpEmbed.addFields({ name: subcommand.name, value: subcommand.description });
      });

      // Send the embed with the subcommands help
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
