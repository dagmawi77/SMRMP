const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;
const NATIONAL_ID_RE = /^[A-Za-z0-9-]{5,20}$/;

export const PASSWORD_RULES = [
  { key: 'length', test: (v) => v.length >= 8 },
  { key: 'upper', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', test: (v) => /[a-z]/.test(v) },
  { key: 'number', test: (v) => /\d/.test(v) },
  { key: 'special', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function isStrongPassword(password = '') {
  return PASSWORD_RULES.every((r) => r.test(password));
}

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

export const NATIONALITY_OPTIONS = [
  { value: 'ethiopian', label: 'Ethiopian' },
  { value: 'eritrean', label: 'Eritrean' },
  { value: 'kenyan', label: 'Kenyan' },
  { value: 'american', label: 'American' },
  { value: 'british', label: 'British' },
  { value: 'other', label: 'Other' },
];

export function buildRegistrationRules(t) {
  return {
    firstName: { required: t.errors.required, minLength: { value: 2, message: t.errors.required } },
    lastName: { required: t.errors.required, minLength: { value: 2, message: t.errors.required } },
    gender: { required: t.errors.required },
    dateOfBirth: { required: t.errors.required },
    nationality: { required: t.errors.required },
    nationalId: {
      required: t.errors.required,
      pattern: { value: NATIONAL_ID_RE, message: t.errors.nationalId },
    },
    email: {
      required: t.errors.required,
      pattern: { value: EMAIL_RE, message: t.errors.email },
    },
    mobilePhone: {
      required: t.errors.required,
      pattern: { value: PHONE_RE, message: t.errors.phone },
    },
    username: {
      required: t.errors.required,
      minLength: { value: 3, message: t.errors.required },
      pattern: { value: /^[a-zA-Z0-9._-]+$/, message: 'Letters, numbers, dots, hyphens only' },
    },
    password: {
      required: t.errors.required,
      validate: (v) => isStrongPassword(v) || t.errors.passwordWeak,
    },
    confirmPassword: { required: t.errors.required },
  };
}

const DEMO_STORE_KEY = 'smrmp_registered_visitors';

export function getRegisteredVisitors() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function mockRegisterVisitor(data, { simulateError } = {}) {
  await new Promise((r) => setTimeout(r, 1200));

  if (simulateError === 'network') {
    const err = new Error('Network Error');
    err.code = 'NETWORK';
    throw err;
  }
  if (simulateError === 'server') {
    const err = new Error('Server error');
    err.code = 'SERVER';
    throw err;
  }

  const existing = getRegisteredVisitors();
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase();

  if (existing.some((v) => v.email === email)) {
    const err = new Error('Duplicate email');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  if (existing.some((v) => v.username === username)) {
    const err = new Error('Duplicate username');
    err.code = 'DUPLICATE_USERNAME';
    throw err;
  }

  const record = {
    id: crypto.randomUUID?.() || String(Date.now()),
    email,
    username,
    firstName: data.firstName,
    lastName: data.lastName,
    nationalId: data.nationalId,
    registeredAt: new Date().toISOString(),
  };
  existing.push(record);
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(existing));
  return record;
}

export { EMAIL_RE, PHONE_RE, NATIONAL_ID_RE };
