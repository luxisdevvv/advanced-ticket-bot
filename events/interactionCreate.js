const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../config');
const fs = require('fs');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true });
      }
      if (interaction.commandName === 'ticket') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Destek türü seçin')
            .addOptions(config.ticket.ticketTypes)
        );
        const embed = new EmbedBuilder()
          .setTitle(config.ticket.ticketMessage.title)
          .setDescription(config.ticket.ticketMessage.description)
          .setColor(config.ticket.ticketMessage.color);
        await interaction.reply({ embeds: [embed], components: [row] });
      }
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
      const type = config.ticket.ticketTypes.find((t) => t.value === interaction.values[0]);
      if (!type) return;
      const existing = interaction.guild.channels.cache.find(
        (c) => c.topic === `ticket-${interaction.user.id}`
      );
      if (existing) return interaction.reply({ content: 'Zaten açık bir ticketin var.', ephemeral: true });
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: config.ticket.ticketCategoryId,
        topic: `ticket-${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          ...config.ticket.staffRoles.map((id) => ({
            id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          })),
        ],
      });
      const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel(config.ticket.closeButtonLabel)
          .setEmoji(config.ticket.closeButtonEmoji)
          .setStyle(ButtonStyle.Danger)
      );
      const embed = new EmbedBuilder()
        .setTitle('Ticket Açıldı')
        .setDescription(`<@${interaction.user.id}> ticket açtı. Destek ekibi en kısa sürede ilgilenecek.`)
        .setColor(config.ticket.ticketMessage.color);
      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeBtn] });
      await interaction.reply({ content: `Ticket açıldı: ${channel}`, ephemeral: true });
      const logEmbed = new EmbedBuilder()
        .setTitle('Yeni Ticket Açıldı')
        .setDescription(`Kullanıcı: <@${interaction.user.id}>\nTür: ${type.label}\nKanal: ${channel}`)
        .setColor(config.ticket.ticketMessage.color);
      const logChannel = interaction.guild.channels.cache.get(config.ticket.ticketLogChannel);
      if (logChannel) logChannel.send({ embeds: [logEmbed] });
    }
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      const channel = interaction.channel;
      if (!channel.topic || !channel.topic.startsWith('ticket-')) return;
      const member = await channel.guild.members.fetch(interaction.user.id);
      const isStaff = member.roles.cache.some((r) => config.ticket.staffRoles.includes(r.id));
      if (!isStaff && !config.ticket.allowUserClose) return interaction.reply({ content: 'Ticketi kapatma yetkin yok.', ephemeral: true });
      if (isStaff && !config.ticket.allowStaffClose) return interaction.reply({ content: 'Ticketi kapatma yetkin yok.', ephemeral: true });
      const starRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_feedback_star')
          .setPlaceholder('Kaç yıldız veriyorsun?')
          .addOptions([
            { label: '1', value: '1', emoji: '⭐' },
            { label: '2', value: '2', emoji: '⭐' },
            { label: '3', value: '3', emoji: '⭐' },
            { label: '4', value: '4', emoji: '⭐' },
            { label: '5', value: '5', emoji: '⭐' },
          ])
      );
      const embed = new EmbedBuilder()
        .setTitle('Geri Bildirim')
        .setDescription('Ticket deneyimini 1-5 yıldız arasında değerlendir ve ardından geri bildirimini yaz.')
        .setColor(0xFEE75C);
      await interaction.reply({ embeds: [embed], components: [starRow], ephemeral: true });
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_feedback_star') {
      const star = interaction.values[0];
      const modal = new ModalBuilder()
        .setCustomId('ticket_feedback_modal')
        .setTitle('Geri Bildirim');
      const feedbackInput = new TextInputBuilder()
        .setCustomId('ticket_feedback_text')
        .setLabel('Geri bildiriminiz')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(feedbackInput));
      await interaction.showModal(modal);
      interaction.channel._pendingFeedback = { star, userId: interaction.user.id };
    }
    if (interaction.isModalSubmit() && interaction.customId === 'ticket_feedback_modal') {
      const feedback = interaction.fields.getTextInputValue('ticket_feedback_text');
      const { star, userId } = interaction.channel._pendingFeedback || {};
      const channel = interaction.channel;
      const messages = await channel.messages.fetch({ limit: 100 });
      const transcript = messages
        .filter((m) => !m.author.bot)
        .map((m) => `${m.author.tag}: ${m.content}`)
        .reverse()
        .join('\n');
      const transcriptFile = `./transcript-${channel.id}.txt`;
      fs.writeFileSync(transcriptFile, transcript);
      const feedbackEmbed = new EmbedBuilder()
        .setTitle('Ticket Geri Bildirim')
        .setDescription(`Yıldız: ${'⭐'.repeat(Number(star))}\nGeri Bildirim: ${feedback}`)
        .setColor(0xFEE75C);
      const transcriptChannel = channel.guild.channels.cache.get(config.ticket.transcriptChannel);
      if (transcriptChannel) transcriptChannel.send({ embeds: [feedbackEmbed], files: [transcriptFile], content: `Ticket transcript: ${channel.name}` });
      const user = await interaction.client.users.fetch(userId);
      if (user) {
        try {
          await user.send({ embeds: [feedbackEmbed] });
          await user.send({ files: [transcriptFile] });
        } catch (err) {
          // luxisdev dm atılmazsa kapatır oto ha bilginiz olsun altyapıcı arkadaşlar
        }
      }
      const logChannel = channel.guild.channels.cache.get(config.ticket.ticketLogChannel);
      if (logChannel) logChannel.send({ embeds: [feedbackEmbed], files: [transcriptFile], content: `Ticket transcript: ${channel.name}` });
      await interaction.reply({ content: 'Geri bildiriminiz ve transcript iletildi, ticket kapanıyor.', ephemeral: true });
      setTimeout(() => {
        channel.delete();
        fs.unlinkSync(transcriptFile);
      }, 3000);
    }
  },
}; 