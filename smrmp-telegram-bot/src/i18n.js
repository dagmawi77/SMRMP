const t = {
  en: {
    welcome:
      '🏛️ *Welcome to {museum}*\n' +
      '_Adwa · Addis Ababa · Ethiopia_\n\n' +
      'Walk the story of victory, courage, and Ethiopian heritage — right from Telegram.\n\n' +
      'I can help you:\n' +
      '• 🕐 Opening hours & visit tips\n' +
      '• 🖼️ See what’s on exhibition\n' +
      '• 🎫 Ticket prices & purchase link\n' +
      '• 📷 Discover artifacts by QR code\n' +
      '• 💬 Ask our visitor guide\n' +
      '• ⭐ Share your visit feedback\n\n' +
      'Choose your language to begin 👇',
    chooseLang: '🌐 Language / ቋንቋ',
    langSet: '✅ Language set to English. Let’s explore the museum.',
    menuTitle: 'What would you like to do?',
    btnHours: '🕐 Hours & info',
    btnExhibitions: '🖼️ Exhibitions',
    btnTickets: '🎫 Tickets',
    btnScan: '📷 Scan artifact',
    btnAsk: '💬 Ask guide',
    btnFeedback: '⭐ Feedback',
    btnLanguage: '🌐 Language',
    btnHelp: '❓ Help',
    btnMenu: '🏠 Main menu',
    btnCancel: '✖️ Cancel',
    hoursTitle: '*Museum hours & info*',
    exhibitionsTitle: '*Current exhibitions*',
    noExhibitions: 'No public exhibitions listed right now. Please check again soon.',
    ticketsTitle: '*Ticket types*',
    buyTickets: 'Buy tickets on the website',
    lookupTicket: 'Look up my ticket',
    askTicketCode: 'Send your ticket QR code (e.g. TKT-XXXX).',
    ticketNotFound: 'Ticket not found. Check the code and try again.',
    scanPrompt:
      'Send an artifact QR code (e.g. ART-XXXX), or open a poster deep-link.\n\nYou can also paste the full QR text.',
    artifactNotFound: 'Artifact not found. This QR code may be invalid.',
    askPrompt: 'Ask me anything about the museum, exhibitions, or visit tips.\n\nSend /cancel to stop.',
    askThinking: 'Thinking…',
    feedbackRate: 'How was your visit? Tap a rating:',
    feedbackComment: 'Optional: send a short comment, or tap Skip.',
    feedbackThanks: 'Thank you! Your feedback helps us improve.',
    feedbackSkip: 'Skip comment',
    cancelled: 'Cancelled. Back to the menu.',
    help:
      '*Commands*\n' +
      '/start — Welcome & menu\n' +
      '/hours — Opening hours\n' +
      '/exhibitions — What’s on\n' +
      '/tickets — Ticket prices & buy link\n' +
      '/scan — Look up an artifact by QR\n' +
      '/ask — Ask the visitor guide\n' +
      '/feedback — Rate your visit\n' +
      '/language — Switch EN / አማርኛ\n' +
      '/help — This help\n\n' +
      'Tip: gallery posters can open me with `t.me/adwamuseumbot?start=ART-XXXX`.',
    error: 'Something went wrong. Please try again in a moment.',
    apiDown:
      '⚠️ I can’t reach the museum server right now.\n\nPlease make sure the SMRMP backend is running, then try again.',
  },
  am: {
    welcome:
      '🏛️ *ወደ {museum} እንኳን በደህና መጡ*\n' +
      '_አድዋ · አዲስ አበባ · ኢትዮጵያ_\n\n' +
      'የድል፣ የጀግንነት እና የኢትዮጵያ ቅርስ ታሪክን ከቴሌግራም ይጀምሩ።\n\n' +
      'እርዳታ ማግኘት የሚችሉባቸው፦\n' +
      '• 🕐 ሰዓትና የጉብኝት ምክሮች\n' +
      '• 🖼️ ኤግዚቢሽኖች\n' +
      '• 🎫 የትኬት ዋጋና ግዢ\n' +
      '• 📷 ቅርሶችን በQR ማግኘት\n' +
      '• 💬 የጎብኚ መመሪያ መጠየቅ\n' +
      '• ⭐ አስተያየት መስጠት\n\n' +
      'ለመጀመር ቋንቋ ይምረጡ 👇',
    chooseLang: '🌐 Language / ቋንቋ',
    langSet: '✅ ቋንቋ ወደ አማርኛ ተቀይሯል። እንጀምር።',
    menuTitle: 'ዛሬ ምን ማድረግ ይፈልጋሉ?',
    btnHours: '🕐 ሰዓትና መረጃ',
    btnExhibitions: '🖼️ ኤግዚቢሽኖች',
    btnTickets: '🎫 ትኬቶች',
    btnScan: '📷 ቅርስ ፈልግ',
    btnAsk: '💬 ጠይቅ',
    btnFeedback: '⭐ አስተያየት',
    btnLanguage: '🌐 ቋንቋ',
    btnHelp: '❓ እገዛ',
    btnMenu: '🏠 ዋና ምናሌ',
    btnCancel: '✖️ ሰርዝ',
    hoursTitle: '*የሙዚየም ሰዓትና መረጃ*',
    exhibitionsTitle: '*አሁን ያሉ ኤግዚቢሽኖች*',
    noExhibitions: 'በአሁኑ ሰዓት የታወቀ ኤግዚቢሽን የለም። ቆይተው ይመልከቱ።',
    ticketsTitle: '*የትኬት ዓይነቶች*',
    buyTickets: 'ትኬት በድረ-ገጽ ይግዙ',
    lookupTicket: 'ትኬቴን ፈልግ',
    askTicketCode: 'የትኬት QR ኮድዎን ይላኩ (ለምሳሌ TKT-XXXX)።',
    ticketNotFound: 'ትኬቱ አልተገኘም። ኮዱን ያረጋግጡ።',
    scanPrompt:
      'የቅርስ QR ኮድ ይላኩ (ለምሳሌ ART-XXXX) ወይም ከፖስተር deep-link ይክፈቱ።',
    artifactNotFound: 'ቅርሱ አልተገኘም። QR ኮዱ ልክ ላይሆን ይችላል።',
    askPrompt: 'ስለ ሙዚየሙ፣ ኤግዚቢሽን ወይም ጉብኝት ይጠይቁ።\n\nለማቆም /cancel ይላኩ።',
    askThinking: 'እያሰብኩ ነው…',
    feedbackRate: 'ጉብኝትዎ እንዴት ነበር? ደረጃ ይምረጡ:',
    feedbackComment: 'አማራጭ፡ አጭር አስተያየት ይላኩ ወይም ዝለልን ይጫኑ።',
    feedbackThanks: 'እናመሰግናለን! አስተያየትዎ ያግዘናል።',
    feedbackSkip: 'አስተያየት ዝለል',
    cancelled: 'ተሰርዟል። ወደ ምናሌ ተመልሰዋል።',
    help:
      '*ትዕዛዞች*\n' +
      '/start — እንኳን ደህና መጡ\n' +
      '/hours — ሰዓታት\n' +
      '/exhibitions — ኤግዚቢሽኖች\n' +
      '/tickets — ትኬት\n' +
      '/scan — ቅርስ በQR\n' +
      '/ask — ጠይቅ\n' +
      '/feedback — አስተያየት\n' +
      '/language — ቋንቋ ቀይር\n' +
      '/help — እገዛ\n\n' +
      'ጠቃሚ፦ `t.me/adwamuseumbot?start=ART-XXXX`',
    error: 'ችግር ተፈጥሯል። ትንሽ ቆይተው ይሞክሩ።',
    apiDown:
      '⚠️ የሙዚየም ሰርቨሩ አሁን አይደርስም።\n\nSMRMP backend እንደሚሰራ ያረጋግጡና እንደገና ይሞክሩ።',
  },
};

function langOf(ctx) {
  return ctx.session?.lang === 'am' ? 'am' : 'en';
}

function tr(ctx, key, vars = {}) {
  const lang = langOf(ctx);
  let text = (t[lang] && t[lang][key]) || t.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v == null ? '' : String(v));
  });
  return text;
}

module.exports = { t, tr, langOf };
