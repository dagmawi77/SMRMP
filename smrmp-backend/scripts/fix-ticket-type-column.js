require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  await client.query(`
    ALTER TABLE tickets
    ALTER COLUMN ticket_type TYPE VARCHAR(50)
    USING ticket_type::text
  `);

  console.log('OK: tickets.ticket_type is now VARCHAR(50)');
  await client.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
