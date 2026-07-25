const config = require('../config');
const api = require('../apiClient');
const { tr, langOf, t } = require('../i18n');
const {
  mainMenu,
  languageKeyboard,
  ratingKeyboard,
  cancelKeyboard,
  ticketsKeyboard,
  feedbackSkipKeyboard,
} = require('../keyboards');

function ensureSession(ctx) {
  if (!ctx.session) ctx.session = {};
  if (!ctx.session.lang) ctx.session.lang = 'en';
  if (!ctx.session.mode) ctx.session.mode = null;
}

function clearMode(ctx) {
  ensureSession(ctx);
  ctx.session.mode = null;
  ctx.session.pendingRating = null;
}

function extractQrCode(text) {
  if (!text) return null;
  const raw = String(text).trim();
  const art = raw.match(/ART-[A-Z0-9]+/i);
  if (art) return art[0].toUpperCase();
  const tkt = raw.match(/TKT-[A-Z0-9]+/i);
  if (tkt) return tkt[0].toUpperCase();
  if (/^[A-Z0-9-]{4,40}$/i.test(raw)) return raw.toUpperCase();
  return null;
}

function truncate(text, max = 3500) {
  if (!text) return '';
  const s = String(text);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function escapeMd(text) {
  return String(text || '').replace(/([_*`\[])/g, '\\$1');
}

async function sendMenu(ctx, extraText) {
  ensureSession(ctx);
  const text = extraText
    ? `${extraText}\n\n${tr(ctx, 'menuTitle')}`
    : tr(ctx, 'menuTitle');
  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...mainMenu(ctx),
  });
}

async function showLanguagePicker(ctx) {
  await ctx.reply(tr(ctx, 'chooseLang'), languageKeyboard());
}

async function handleStart(ctx) {
  ensureSession(ctx);
  clearMode(ctx);

  const payload = ctx.startPayload || '';
  const welcome = tr(ctx, 'welcome', { museum: config.museumName });

  if (payload) {
    const code = extractQrCode(payload);
    await ctx.reply(welcome, { parse_mode: 'Markdown', ...mainMenu(ctx) });
    if (code) {
      if (code.startsWith('TKT-')) {
        return showTicket(ctx, code);
      }
      return showArtifact(ctx, code);
    }
    return;
  }

  await ctx.reply(welcome, {
    parse_mode: 'Markdown',
    ...languageKeyboard(),
  });
}

function fallbackMuseumInfo() {
  return {
    name: config.museumName,
    city: 'Addis Ababa, Ethiopia',
    hours: {
      weekdays: 'Tue–Fri 09:00–17:00',
      weekend: 'Sat–Sun 10:00–18:00',
      closed: 'Mondays & public holidays',
    },
    address: 'Adwa Victory Memorial Museum, Addis Ababa',
    tips: [
      'Bring your digital ticket QR for entry',
      'Scan artifact QR codes in this bot or on the museum website',
      'Follow photography rules posted in each gallery',
    ],
    tickets_url: `${config.frontendUrl}/tickets`,
    phone: config.museumPhone,
  };
}

async function showHours(ctx) {
  ensureSession(ctx);
  let info;
  try {
    info = await api.getMuseumInfo();
  } catch (_e) {
    info = fallbackMuseumInfo();
  }

  const hours = info.hours || {};
  const lines = [
    tr(ctx, 'hoursTitle'),
    '',
    `🏛 ${escapeMd(info.name || config.museumName)}`,
    info.city ? `📍 ${escapeMd(info.city)}` : null,
    hours.weekdays ? `• ${escapeMd(hours.weekdays)}` : null,
    hours.weekend ? `• ${escapeMd(hours.weekend)}` : null,
    hours.closed ? `• Closed: ${escapeMd(hours.closed)}` : null,
    info.address ? `\n${escapeMd(info.address)}` : null,
    info.phone || config.museumPhone
      ? `📞 ${escapeMd(info.phone || config.museumPhone)}`
      : null,
    info.tickets_url ? `\n🎫 ${info.tickets_url}` : null,
  ].filter(Boolean);

  if (Array.isArray(info.tips) && info.tips.length) {
    lines.push('', '*Tips*');
    info.tips.forEach((tip) => lines.push(`• ${escapeMd(tip)}`));
  }

  await ctx.reply(lines.join('\n'), {
    parse_mode: 'Markdown',
    ...mainMenu(ctx),
  });
}

async function showExhibitions(ctx) {
  ensureSession(ctx);
  try {
    const exhibitions = await api.getExhibitions('current');
    if (!exhibitions.length) {
      await ctx.reply(tr(ctx, 'noExhibitions'), mainMenu(ctx));
      return;
    }

    const chunks = [tr(ctx, 'exhibitionsTitle'), ''];
    exhibitions.forEach((ex, i) => {
      const dates = [ex.start_date, ex.end_date].filter(Boolean).join(' → ');
      chunks.push(
        `*${i + 1}. ${escapeMd(ex.name)}*`,
        ex.status ? `_Status:_ ${escapeMd(ex.status)}` : null,
        dates ? `_Dates:_ ${escapeMd(dates)}` : null,
        ex.gallery ? `_Gallery:_ ${escapeMd(ex.gallery)}` : null,
        ex.description ? truncate(escapeMd(ex.description), 280) : null,
        ''
      );
    });

    await ctx.reply(chunks.filter((x) => x !== null).join('\n'), {
      parse_mode: 'Markdown',
      ...mainMenu(ctx),
    });
  } catch (_e) {
    await ctx.reply(tr(ctx, 'apiDown'), mainMenu(ctx));
  }
}

async function showTickets(ctx) {
  ensureSession(ctx);
  let types = [];
  let info = {};

  try {
    [types, info] = await Promise.all([
      api.getTicketTypes(),
      api.getMuseumInfo().catch(() => fallbackMuseumInfo()),
    ]);
  } catch (error) {
    console.error('[tickets] API error:', error.message);
    const ticketsUrl = `${config.frontendUrl}/tickets`;
    await ctx.reply(
      `${tr(ctx, 'apiDown')}\n\nYou can still buy tickets here:\n${ticketsUrl}`,
      {
        ...ticketsKeyboard(ctx, ticketsUrl),
        ...mainMenu(ctx),
      }
    );
    return;
  }

  const ticketsUrl = info.tickets_url || `${config.frontendUrl}/tickets`;
  const lines = [tr(ctx, 'ticketsTitle').replace(/\*/g, ''), ''];

  if (!types.length) {
    lines.push('No ticket types configured yet.');
  } else {
    types.forEach((ticketType) => {
      const price = Number(ticketType.price_etb);
      const priceText = Number.isFinite(price) ? `${price.toFixed(0)} ETB` : 'Price TBA';
      lines.push(`• ${ticketType.label || ticketType.type} — ${priceText}`);
      if (ticketType.description) {
        lines.push(`  ${truncate(String(ticketType.description), 200)}`);
      }
    });
  }

  lines.push('', `Buy online: ${ticketsUrl}`);

  try {
    await ctx.reply(lines.join('\n'), ticketsKeyboard(ctx, ticketsUrl));
  } catch (error) {
    console.error('[tickets] Telegram send error:', error.message);
    await ctx.reply(lines.join('\n'), mainMenu(ctx));
  }
}

async function showTicket(ctx, code) {
  try {
    const ticket = await api.getTicketByCode(code);
    const lines = [
      '*Your ticket*',
      '',
      `Code: \`${ticket.qr_ticket_code}\``,
      `Type: ${escapeMd(ticket.ticket_label || ticket.ticket_type)}`,
      `Visitor: ${escapeMd(ticket.visitor_name)}`,
      `Date: ${escapeMd(ticket.visit_date)}`,
      `Qty: ${ticket.quantity}`,
      `Status: *${escapeMd(ticket.status)}*`,
      `Payment: ${escapeMd(ticket.payment_status)}`,
    ];
    await ctx.reply(lines.join('\n'), {
      parse_mode: 'Markdown',
      ...mainMenu(ctx),
    });
  } catch (e) {
    if (e.status === 404) {
      await ctx.reply(tr(ctx, 'ticketNotFound'), mainMenu(ctx));
      return;
    }
    await ctx.reply(tr(ctx, 'apiDown'), mainMenu(ctx));
  }
}

async function showArtifact(ctx, code) {
  ensureSession(ctx);
  try {
    const data = await api.getArtifactByQR(code);
    const artifact = data.artifact || data;
    const primary =
      (artifact.images || []).find((i) => i.is_primary) ||
      (artifact.images || [])[0];

    const webUrl = `${config.frontendUrl}/artifact/${encodeURIComponent(
      artifact.qr_code || code
    )}`;

    const desc =
      langOf(ctx) === 'am' && artifact.amharic_description
        ? artifact.amharic_description
        : artifact.description || artifact.ai_description || '';

    const caption = [
      `*${escapeMd(artifact.name)}*`,
      artifact.category ? `_Category:_ ${escapeMd(artifact.category)}` : null,
      artifact.historical_period
        ? `_Period:_ ${escapeMd(artifact.historical_period)}`
        : null,
      artifact.origin ? `_Origin:_ ${escapeMd(artifact.origin)}` : null,
      artifact.location ? `_Location:_ ${escapeMd(artifact.location)}` : null,
      artifact.qr_code ? `_QR:_ \`${artifact.qr_code}\`` : null,
      '',
      truncate(escapeMd(desc), 900),
      '',
      `[Open full page](${webUrl})`,
    ]
      .filter((x) => x !== null)
      .join('\n');

    const imageUrl = primary?.file_url || primary?.file_path;
    if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
      await ctx.replyWithPhoto(imageUrl, {
        caption: truncate(caption, 1000),
        parse_mode: 'Markdown',
        ...mainMenu(ctx),
      });
    } else {
      await ctx.reply(caption, { parse_mode: 'Markdown', ...mainMenu(ctx) });
    }
  } catch (e) {
    if (e.status === 404) {
      await ctx.reply(tr(ctx, 'artifactNotFound'), mainMenu(ctx));
      return;
    }
    await ctx.reply(tr(ctx, 'apiDown'), mainMenu(ctx));
  }
}

async function beginScan(ctx) {
  ensureSession(ctx);
  ctx.session.mode = 'scan';
  await ctx.reply(tr(ctx, 'scanPrompt'), cancelKeyboard(ctx));
}

async function beginAsk(ctx) {
  ensureSession(ctx);
  ctx.session.mode = 'ask';
  await ctx.reply(tr(ctx, 'askPrompt'), cancelKeyboard(ctx));
}

async function beginTicketLookup(ctx) {
  ensureSession(ctx);
  ctx.session.mode = 'ticket';
  await ctx.reply(tr(ctx, 'askTicketCode'), cancelKeyboard(ctx));
}

async function beginFeedback(ctx) {
  ensureSession(ctx);
  ctx.session.mode = 'feedback_rate';
  await ctx.reply(tr(ctx, 'feedbackRate'), ratingKeyboard());
}

async function handleAskQuestion(ctx, question) {
  ensureSession(ctx);
  await ctx.reply(tr(ctx, 'askThinking'));
  try {
    const result = await api.askGuide(question, langOf(ctx));
    await ctx.reply(truncate(result.answer || tr(ctx, 'error')), mainMenu(ctx));
  } catch (_e) {
    await ctx.reply(tr(ctx, 'apiDown'), mainMenu(ctx));
  } finally {
    clearMode(ctx);
  }
}

async function saveFeedback(ctx, comment) {
  ensureSession(ctx);
  const rating = ctx.session.pendingRating;
  if (!rating) {
    clearMode(ctx);
    await sendMenu(ctx);
    return;
  }

  try {
    await api.submitFeedback({
      rating,
      comment: comment || null,
      telegram_user_id: String(ctx.from.id),
      telegram_username: ctx.from.username || null,
      visitor_name: [ctx.from.first_name, ctx.from.last_name]
        .filter(Boolean)
        .join(' '),
      language: langOf(ctx),
      source: 'telegram',
    });
    await ctx.reply(tr(ctx, 'feedbackThanks'), mainMenu(ctx));
  } catch (_e) {
    await ctx.reply(tr(ctx, 'error'), mainMenu(ctx));
  } finally {
    clearMode(ctx);
  }
}

function matchMenuLabel(ctx, text) {
  const labels = [
    'btnHours',
    'btnExhibitions',
    'btnTickets',
    'btnScan',
    'btnAsk',
    'btnFeedback',
    'btnLanguage',
    'btnHelp',
    'btnMenu',
    'btnCancel',
  ];
  for (const key of labels) {
    if (text === tr(ctx, key) || text === t.en[key] || text === t.am[key]) {
      return key;
    }
  }
  return null;
}

async function handleText(ctx) {
  ensureSession(ctx);
  const text = (ctx.message && ctx.message.text) || '';
  if (!text || text.startsWith('/')) return;

  const menuKey = matchMenuLabel(ctx, text);
  if (menuKey === 'btnCancel' || menuKey === 'btnMenu') {
    clearMode(ctx);
    await ctx.reply(tr(ctx, 'cancelled'), mainMenu(ctx));
    return;
  }

  if (ctx.session.mode === 'ask') {
    await handleAskQuestion(ctx, text);
    return;
  }

  if (ctx.session.mode === 'scan') {
    const code = extractQrCode(text);
    clearMode(ctx);
    if (!code) {
      await ctx.reply(tr(ctx, 'artifactNotFound'), mainMenu(ctx));
      return;
    }
    await showArtifact(ctx, code);
    return;
  }

  if (ctx.session.mode === 'ticket') {
    const code = extractQrCode(text);
    clearMode(ctx);
    if (!code) {
      await ctx.reply(tr(ctx, 'ticketNotFound'), mainMenu(ctx));
      return;
    }
    await showTicket(ctx, code);
    return;
  }

  if (ctx.session.mode === 'feedback_comment') {
    await saveFeedback(ctx, text);
    return;
  }

  if (menuKey === 'btnHours') return showHours(ctx);
  if (menuKey === 'btnExhibitions') return showExhibitions(ctx);
  if (menuKey === 'btnTickets') return showTickets(ctx);
  if (menuKey === 'btnScan') return beginScan(ctx);
  if (menuKey === 'btnAsk') return beginAsk(ctx);
  if (menuKey === 'btnFeedback') return beginFeedback(ctx);
  if (menuKey === 'btnLanguage') return showLanguagePicker(ctx);
  if (menuKey === 'btnHelp') {
    await ctx.reply(tr(ctx, 'help'), { parse_mode: 'Markdown', ...mainMenu(ctx) });
    return;
  }

  // Free-text: try QR detection, else treat as ask
  const maybeCode = extractQrCode(text);
  if (maybeCode && (maybeCode.startsWith('ART-') || text.length < 40)) {
    if (maybeCode.startsWith('TKT-')) return showTicket(ctx, maybeCode);
    if (maybeCode.startsWith('ART-')) return showArtifact(ctx, maybeCode);
  }

  await handleAskQuestion(ctx, text);
}

module.exports = {
  ensureSession,
  clearMode,
  handleStart,
  showHours,
  showExhibitions,
  showTickets,
  showTicket,
  showArtifact,
  beginScan,
  beginAsk,
  beginTicketLookup,
  beginFeedback,
  handleAskQuestion,
  saveFeedback,
  handleText,
  sendMenu,
  showLanguagePicker,
  extractQrCode,
};
