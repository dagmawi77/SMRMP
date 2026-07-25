/**
 * Creates (or updates) Supabase Auth users for staff profiles in public.users,
 * using the same UUID so auth.users.id === public.users.id.
 *
 * Usage:
 *   node scripts/sync-supabase-auth-users.js
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ DB_* for Sequelize).
 */
require('dotenv').config();

const { User, sequelize } = require('../src/models');
const { getSupabaseAdmin } = require('../src/config/supabase');

const DEMO_PASSWORD = process.env.DEMO_AUTH_PASSWORD || 'Demo@2026!';

// Must match seeders/20260725170100-demo-data.js staff emails
const DEMO_EMAILS = [
  'admin@adwa.museum',
  'curator@adwa.museum',
  'conservation@adwa.museum',
];

async function upsertAuthUser(profile) {
  const admin = getSupabaseAdmin();
  const email = profile.email.toLowerCase();

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existing = listed.users.find((u) => u.email?.toLowerCase() === email);

  if (existing) {
    if (existing.id !== profile.id) {
      console.warn(
        `⚠ ${email}: auth id ${existing.id} ≠ profile id ${profile.id}. ` +
          'Login still works via email fallback; recreate auth user to align ids.',
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: profile.name, role: profile.role },
      app_metadata: { role: profile.role },
    });
    if (updateError) throw updateError;
    console.log(`✓ updated Auth user ${email}`);
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    id: profile.id,
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: profile.name, role: profile.role },
    app_metadata: { role: profile.role },
  });
  if (error) throw error;

  console.log(`✓ created Auth user ${email} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  await sequelize.authenticate();

  const profiles = await User.findAll({
    where: { email: DEMO_EMAILS, is_active: true },
  });

  if (!profiles.length) {
    console.error('No demo staff profiles found. Run db:seed first.');
    process.exit(1);
  }

  for (const profile of profiles) {
    // Clear legacy bcrypt hash — Auth owns the password now.
    if (profile.password) {
      await profile.update({ password: null });
    }
    await upsertAuthUser(profile);
  }

  console.log(`\nDone. Sign in with Demo password: ${DEMO_PASSWORD}`);
  await sequelize.close();
}

main().catch(async (error) => {
  console.error('Sync failed:', error.message || error);
  try {
    await sequelize.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
