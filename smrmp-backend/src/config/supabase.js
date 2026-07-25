const { createClient } = require('@supabase/supabase-js');

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

let supabaseAuth;
let supabaseAdmin;

/** Anon client — sign-in + JWT verification via Auth API. */
const getSupabaseAuth = () => {
  if (supabaseAuth) return supabaseAuth;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required.');
  }

  supabaseAuth = createClient(url, anonKey, authOptions);
  return supabaseAuth;
};

/** Service-role client — admin user provisioning only. */
const getSupabaseAdmin = () => {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin auth operations.');
  }

  supabaseAdmin = createClient(url, serviceKey, authOptions);
  return supabaseAdmin;
};

module.exports = { getSupabaseAuth, getSupabaseAdmin };
