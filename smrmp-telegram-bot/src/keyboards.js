const { Markup } = require('telegraf');
const { tr } = require('./i18n');

function mainMenu(ctx) {
  return Markup.keyboard([
    [tr(ctx, 'btnHours'), tr(ctx, 'btnExhibitions')],
    [tr(ctx, 'btnTickets'), tr(ctx, 'btnScan')],
    [tr(ctx, 'btnAsk'), tr(ctx, 'btnFeedback')],
    [tr(ctx, 'btnLanguage'), tr(ctx, 'btnHelp')],
  ])
    .resize()
    .persistent();
}

function languageKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('English', 'lang:en'),
      Markup.button.callback('አማርኛ', 'lang:am'),
    ],
  ]);
}

function ratingKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐ 1', 'rate:1'),
      Markup.button.callback('⭐ 2', 'rate:2'),
      Markup.button.callback('⭐ 3', 'rate:3'),
    ],
    [
      Markup.button.callback('⭐ 4', 'rate:4'),
      Markup.button.callback('⭐ 5', 'rate:5'),
    ],
  ]);
}

function cancelKeyboard(ctx) {
  return Markup.keyboard([[tr(ctx, 'btnCancel')], [tr(ctx, 'btnMenu')]])
    .resize()
    .oneTime();
}

function ticketsKeyboard(ctx, ticketsUrl) {
  const rows = [];
  if (ticketsUrl) {
    rows.push([Markup.button.url(tr(ctx, 'buyTickets'), ticketsUrl)]);
  }
  rows.push([Markup.button.callback(tr(ctx, 'lookupTicket'), 'ticket:lookup')]);
  rows.push([Markup.button.callback(tr(ctx, 'btnMenu'), 'menu:home')]);
  return Markup.inlineKeyboard(rows);
}

function feedbackSkipKeyboard(ctx) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(tr(ctx, 'feedbackSkip'), 'feedback:skip')],
  ]);
}

module.exports = {
  mainMenu,
  languageKeyboard,
  ratingKeyboard,
  cancelKeyboard,
  ticketsKeyboard,
  feedbackSkipKeyboard,
};
