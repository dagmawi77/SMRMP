/**
 * Resolve Postgres connection settings for runtime + sequelize-cli.
 * Supports discrete DB_* vars (preferred in .env.example) OR Render's DATABASE_URL.
 */
function resolveDbEnv() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && String(databaseUrl).trim()) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

function useSsl() {
  if (process.env.DB_SSL === 'true') return true;
  // Render / managed Postgres URLs usually need SSL
  if (process.env.DATABASE_URL && process.env.DB_SSL !== 'false') return true;
  return false;
}

module.exports = { resolveDbEnv, useSsl };
