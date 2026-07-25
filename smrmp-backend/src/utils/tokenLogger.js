/**
 * AI token usage logger — PRD AI principle: monitor tokens per request.
 */
const logTokenUsage = ({ endpoint, model, tokensUsed, userId = null }) => {
  const entry = {
    type: 'AI_TOKEN_USAGE',
    endpoint,
    model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    tokens_used: tokensUsed ?? 0,
    user_id: userId,
    timestamp: new Date().toISOString(),
  };

  console.log('[AI_TOKENS]', JSON.stringify(entry));
  return entry;
};

module.exports = { logTokenUsage };
