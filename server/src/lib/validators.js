'use strict';

/**
 * Pure input validators (REQ-01, REQ-02).
 * Kept free of I/O so every branch can be unit tested.
 */

const STUDENT_ID_REGEX = /^[A-Z]{2}\d{6}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 20;

function validateStudentId(id) {
  if (typeof id !== 'string' || id.length === 0) {
    return { valid: false, error: 'Student ID is required' };
  }
  if (!STUDENT_ID_REGEX.test(id)) {
    return { valid: false, error: 'Student ID must be two uppercase letters followed by six digits' };
  }
  return { valid: true };
}

function validatePassword(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, errors: ['Password is required'] };
  }
  if (password.length < PASSWORD_MIN) errors.push(`Password must be at least ${PASSWORD_MIN} characters`);
  if (password.length > PASSWORD_MAX) errors.push(`Password must be at most ${PASSWORD_MAX} characters`);
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a digit');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character');
  return { valid: errors.length === 0, errors };
}

module.exports = { validateStudentId, validatePassword, PASSWORD_MIN, PASSWORD_MAX };
