const { Telegraf, session } = require('telegraf');
const config = require('./config');
const { tr } = require('./i18n');
const { mainMenu, feedbackSkipKeyboard } = require('./keyboards');
const h = require('./handlers/visitorHandlers');

const bot = new Telegraf(config.botToken);

bot.use(session());
bot.use(async (ctx, next) => {
  h.ensureSession(ctx);
  return next();
});

bot.start(h.handleStart);
bot.command('help', async (ctx) => {
  await ctx.reply(tr(ctx, 'help'), { parse_mode: 'Markdown', ...mainMenu(ctx) });
});
bot.command('hours', h.showHours);
bot.command('exhibitions', h.showExhibitions);
bot.command('tickets', h.showTickets);
bot.command('scan', h.beginScan);
bot.command('ask', h.beginAsk);
bot.command('feedback', h.beginFeedback);
bot.command('language', h.showLanguagePicker);
bot.command('menu', (ctx) => h.sendMenu(ctx));
bot.command('cancel', async (ctx) => {
  h.clearMode(ctx);
  await ctx.reply(tr(ctx, 'cancelled'), mainMenu(ctx));
});

bot.action(/^lang:(en|am)$/, async (ctx) => {
  const lang = ctx.match[1];
  h.ensureSession(ctx);
  ctx.session.lang = lang;
  await ctx.answerCbQuery();
  await ctx.reply(tr(ctx, 'langSet'), mainMenu(ctx));
  await h.sendMenu(ctx);
});

bot.action('ticket:lookup', async (ctx) => {
  await ctx.answerCbQuery();
  await h.beginTicketLookup(ctx);
});

bot.action('menu:home', async (ctx) => {
  await ctx.answerCbQuery();
  h.clearMode(ctx);
  await h.sendMenu(ctx);
});

bot.action(/^rate:([1-5])$/, async (ctx) => {
  const rating = parseInt(ctx.match[1], 10);
  h.ensureSession(ctx);
  ctx.session.pendingRating = rating;
  ctx.session.mode = 'feedback_comment';
  await ctx.answerCbQuery();
  await ctx.reply(tr(ctx, 'feedbackComment'), feedbackSkipKeyboard(ctx));
});

bot.action('feedback:skip', async (ctx) => {
  await ctx.answerCbQuery();
  await h.saveFeedback(ctx, null);
});

bot.on('text', h.handleText);

bot.catch((err, ctx) => {
  console.error('Bot error', err);
  ctx.reply(tr(ctx, 'error')).catch(() => {});
});

async function launch() {
  const me = await bot.telegram.getMe();
  console.log(`Connected as @${me.username} (${me.first_name})`);

  if (config.mode === 'webhook') {
    if (!config.webhookDomain) {
      throw new Error('WEBHOOK_DOMAIN is required when BOT_MODE=webhook');
    }
    const url = `${config.webhookDomain.replace(/\/$/, '')}${config.webhookPath}`;
    console.log(`SMRMP visitor bot webhook listening on :${config.port} → ${url}`);
    await bot.launch({
      webhook: {
        domain: config.webhookDomain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        hookPath: config.webhookPath,
        port: config.port,
      },
    });
  } else {
    console.log('SMRMP visitor bot started (long polling)');
    console.log(`API: ${config.apiUrl}`);
    console.log(`Museum: ${config.museumName}`);
    console.log(`Open: https://t.me/${me.username}`);

    const health = await require('./apiClient').pingApi();
    if (health) {
      console.log(`Backend health: ${health.status || 'ok'}`);
    } else {
      console.warn(
        'WARNING: Backend not reachable at',
        config.apiUrl,
        '- start smrmp-backend (npm run dev) or exhibitions/tickets/AI will fail.'
      );
    }

    await bot.launch({ dropPendingUpdates: true });
  }
}

launch().catch((err) => {
  console.error('Failed to start bot:', err.message);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
