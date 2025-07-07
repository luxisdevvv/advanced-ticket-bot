module.exports = {
  token: 'doldur',
  botId: 'doldur',
  ticket: {
    ticketCategoryId: 'doldur',
    staffRoles: [
      'doldur'
    ],
    transcriptChannel: 'doldur',
    ticketLogChannel: 'doldur',
    closeButtonLabel: 'Kapat',
    closeButtonEmoji: '🔒',
    dmTranscript: true,
    ticketTypes: [
      {
        label: 'VDS Sponsor',
        value: 'vds_sponsor',
        description: 'VDS sponsor desteği için ticket aç.'
      },
      {
        label: 'Genel Destek',
        value: 'genel_destek',
        description: 'Genel destek için ticket aç.'
      },
      {
        label: 'Diğer',
        value: 'diger',
        description: 'Diğer konular için ticket aç.'
      },
    ],
    ticketMessage: {
      title: 'Destek Talebi Oluştur',
      description: 'Aşağıdan bir destek türü seçin ve ticket açın.',
      color: 0x5865F2,
    },
    closeMessage: {
      title: 'Ticket Kapandı',
      description: 'Ticket kapatıldı. Transcript ve detaylar DM olarak gönderildi.',
      color: 0xED4245,
    },
    dmMessage: {
      title: 'Ticket Transcript',
      description: 'Aşağıda ticket transcript ve detayları bulabilirsin.',
      color: 0x57F287,
    },
    deleteOnUserClose: false,
    deleteOnStaffClose: true,
    allowUserClose: true,
    allowStaffClose: true,
  },
}; 