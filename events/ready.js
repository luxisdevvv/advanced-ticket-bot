const chalk = require('chalk');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('../config');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setActivity('LuxisDev Tarafından Yapılmıştır.');
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      commands.push(command.data.toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
      await rest.put(
        Routes.applicationCommands(config.botId),
        { body: commands },
      );
      console.log(chalk.hex('#57F287')('Slash komutları başarıyla kaydedildi!'));
    } catch (error) {
      console.log(chalk.hex('#ED4245')('Slash komutları kaydedilemedi!'));
      console.error(error);
    }
    
    // luxisdev
    console.log(chalk.hex('#5865F2')(' _                         _________ _______  ______   _______'));
    console.log(chalk.hex('#5865F2')('( \\      |\\     /||\\     /|\\__   __/(  ____ \\(  __  \\ (  ____ \\|\\     /|'));
    console.log(chalk.hex('#5865F2')('| (      | )   ( |( \\   / )   ) (   | (    \\/| (  \\  )| (    \\/| )   ( |'));
    console.log(chalk.hex('#5865F2')('| |      | |   | | \\ (_) /    | |   | (_____ | |   ) || (__    | |   | |'));
    console.log(chalk.hex('#5865F2')('| |      | |   | |  ) _ (     | |   (_____  )| |   | ||  __)   ( (   ) )'));
    console.log(chalk.hex('#5865F2')('| |      | |   | | / ( ) \\    | |         ) || |   ) || (       \\ \\_/ /'));
    console.log(chalk.hex('#5865F2')('| (____/\\| (___) |( /   \\ )___) (___/\\____) || (__/  )| (____/\\  \\   /'));
    console.log(chalk.hex('#5865F2')('(_______/(_______)|/     \\|\\_______/\\_______)(______/ (_______/   \\_/'));
    console.log('');
    
    console.log(
      chalk.bgHex('#5865F2').white.bold(' [Luxis Ticket] ') +
      chalk.hex('#57F287')(` Bot Aktif! `) +
      chalk.hex('#ED4245')(` Kullanıcı: `) +
      chalk.white(`${client.user.tag}`)
    );
    console.log(
      chalk.hex('#FEE75C')('---------------------------------------------')
    );
    console.log(
      chalk.hex('#5865F2')('Discord: ') + chalk.white('discord.gg/bedavavds')
    );
    console.log(
      chalk.hex('#57F287')('Geliştirici: ') + chalk.white('LuxisDev')
    );
    console.log(
      chalk.hex('#ED4245')('Bot başarıyla başlatıldı!')
    );
    console.log(
      chalk.hex('#FEE75C')('---------------------------------------------')
    );
  },
};
