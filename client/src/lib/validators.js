const STUDENT_ID_REGEX = /^[A-Z]{2}\d{6}$/;

export function validateStudentId(id) {
  if (typeof id !== 'string' || id.length === 0) return { valid: false, error: 'Student ID is required' };
  if (!STUDENT_ID_REGEX.test(id)) {
    return { valid: false, error: 'Student ID must be two uppercase letters followed by six digits' };
  }
  return { valid: true };
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length === 0) return { valid: false, errors: ['Password is required'] };
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 20) errors.push('Password must be at most 20 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a digit');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character');
  return { valid: errors.length === 0, errors };
}
