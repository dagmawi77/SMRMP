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
    password: {
      required: t.errors.required,
      validate: (v) => isStrongPassword(v) || t.errors.passwordWeak,
    },
    confirmPassword: { required: t.errors.required },
  };
}

import { authApi } from '../api/authApi';
import getApiErrorMessage from './apiError';

/**
 * Registers a visitor via POST /api/auth/register.
 * Throws an Error with `.code` for the registration form to map to UI copy.
 */
export async function registerVisitor(data) {
  try {
    const res = await authApi.register({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      nationalId: data.nationalId.trim(),
      email: data.email.trim(),
      mobilePhone: data.mobilePhone.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    return res.data?.data?.user;
  } catch (error) {
    const err = new Error(
      getApiErrorMessage(error, 'Something went wrong on our end. Please try again later.'),
    );

    if (!error.response) {
      err.code = 'NETWORK';
      throw err;
    }

    const apiCode = error.response.data?.errors?.code;
    if (apiCode === 'DUPLICATE_EMAIL') {
      err.code = apiCode;
      throw err;
    }

    const status = error.response.status;
    if (status === 409) {
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    err.code = status >= 500 ? 'SERVER' : 'VALIDATION';
    throw err;
  }
}

export { EMAIL_RE, PHONE_RE, NATIONAL_ID_RE };
