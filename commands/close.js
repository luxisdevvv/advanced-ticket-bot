const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Ticketi kapat.'),
  async execute(interaction) {
    if (!interaction.channel.topic || !interaction.channel.topic.startsWith('ticket-')) return;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isStaff = member.roles.cache.some((r) => config.ticket.staffRoles.includes(r.id));
    if (!isStaff && !config.ticket.allowUserClose) return interaction.reply({ content: 'Ticketi kapatma yetkin yok.', ephemeral: true });
    if (isStaff && !config.ticket.allowStaffClose) return interaction.reply({ content: 'Ticketi kapatma yetkin yok.', ephemeral: true });
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .filter((m) => !m.author.bot)
      .map((m) => `${m.author.tag}: ${m.content}`)
      .reverse()
      .join('\n');
    const transcriptFile = `./transcript-${interaction.channel.id}.txt`;
    fs.writeFileSync(transcriptFile, transcript);
    const embed = new EmbedBuilder()
      .setTitle(config.ticket.closeMessage.title)
      .setDescription(config.ticket.closeMessage.description)
      .setColor(config.ticket.closeMessage.color);
    await interaction.channel.send({ embeds: [embed] });
    const logEmbed = new EmbedBuilder()
      .setTitle('Ticket Kapandı')
      .setDescription(`Kanal: ${interaction.channel}\nKapatan: <@${interaction.user.id}>`)
      .setColor(config.ticket.closeMessage.color);
    const logChannel = interaction.guild.channels.cache.get(config.ticket.ticketLogChannel);
    if (logChannel) logChannel.send({ embeds: [logEmbed] });
    const transcriptChannel = interaction.guild.channels.cache.get(config.ticket.transcriptChannel);
    if (transcriptChannel) transcriptChannel.send({ files: [transcriptFile], content: `Ticket transcript: ${interaction.channel.name}` });
    if (config.ticket.dmTranscript) {
      const userId = interaction.channel.topic.split('-')[1];
      const user = await interaction.client.users.fetch(userId);
      if (user) {
        const dmEmbed = new EmbedBuilder()
          .setTitle(config.ticket.dmMessage.title)
          .setDescription(config.ticket.dmMessage.description)
          .setColor(config.ticket.dmMessage.color);
        await user.send({ embeds: [dmEmbed] });
        await user.send({ files: [transcriptFile] });
      }
    }
    if ((isStaff && config.ticket.deleteOnStaffClose) || (!isStaff && config.ticket.deleteOnUserClose)) {
      setTimeout(() => {
        interaction.channel.delete();
        fs.unlinkSync(transcriptFile);
      }, 3000);
    } else {
      fs.unlinkSync(transcriptFile);
    }
  },
}; 