import { API_BASE_URL } from '../api/axios';

/**
 * Turns login / API failures into a message worth showing a user.
 * Covers Supabase Auth errors, the SMRMP { success, message, errors }
 * envelope, express-rate-limit's bare string body, and network failures.
 */
export default function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  // Supabase Auth errors (AuthApiError) — no axios response.
  if (!error.response && typeof error.message === 'string' && error.message) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('invalid login credentials')
      || msg.includes('invalid email or password')
    ) {
      return fallback;
    }
    if (msg.includes('email not confirmed')) {
      return 'Confirm your email before signing in.';
    }
    if (error.status === 401 || error.code === 'invalid_credentials') {
      return fallback;
    }
    // Non-Auth thrown Errors from our own hooks still use message.
    if (!error.code && !error.status && error.message !== 'Unexpected login response from server') {
      // fall through for axios-shaped errors without response
    } else if (error.code || error.status) {
      return error.message;
    }
  }

  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
    if (error.message === 'Unexpected login response from server') {
      return 'The server returned an unexpected response. Check that the SMRMP API is running a compatible version.';
    }
    // Pure Supabase credential failures already mapped above; remaining
    // no-response cases are usually a down API after Auth succeeded.
    if (error.name === 'AuthApiError' || error.__isAuthError) {
      return error.message || fallback;
    }
    return `Cannot reach the SMRMP API at ${API_BASE_URL}. Check that the backend is running.`;
  }

  const { status, data } = error.response;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data?.message) {
    if (Array.isArray(data.errors) && data.errors.length) {
      const details = data.errors.map((item) => item.msg).filter(Boolean).join(', ');
      if (details) return `${data.message}: ${details}`;
    }
    return data.message;
  }

  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  if (status >= 500) return 'The server encountered an error. Please try again.';

  return fallback;
}
