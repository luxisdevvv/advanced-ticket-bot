const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Destek talebi oluştur.'),
  async execute(interaction) {
    // luxisdev
  },
}; 