const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transcript')
    .setDescription('Ticket transcriptini oluştur ve gönder.'),
  async execute(interaction) {
    if (!interaction.channel.topic || !interaction.channel.topic.startsWith('ticket-')) return;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.some((r) => config.ticket.staffRoles.includes(r.id));
    if (!isStaff) return interaction.reply({ content: 'Yetkin yok.', ephemeral: true });
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .filter((m) => !m.author.bot)
      .map((m) => `${m.author.tag}: ${m.content}`)
      .reverse()
      .join('\n');
    const transcriptFile = `./transcript-${interaction.channel.id}.txt`;
    fs.writeFileSync(transcriptFile, transcript);
    const embed = new EmbedBuilder()
      .setTitle('Ticket Transcript')
      .setDescription('Aşağıda ticket transcript dosyası var.')
      .setColor(0x57F287);
    await interaction.reply({ embeds: [embed], files: [transcriptFile], ephemeral: true });
    fs.unlinkSync(transcriptFile);
  },
}; 