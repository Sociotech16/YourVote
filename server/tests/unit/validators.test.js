'use strict';

const { validateStudentId, validatePassword } = require('../../src/lib/validators');

/**
 * Test design: Equivalence Partitioning (EP) and Boundary Value Analysis (BVA)
 * Requirements: REQ-01 (student ID), REQ-02 (password)
 */

describe('validateStudentId: EP (REQ-01)', () => {
  test.each([
    ['TC-EP-ID-01', 'AB123456', true, 'valid: 2 uppercase + 6 digits'],
    ['TC-EP-ID-02', 'ab123456', false, 'invalid: lowercase letters'],
    ['TC-EP-ID-03', 'A1234567', false, 'invalid: only one letter'],
    ['TC-EP-ID-04', 'ABC12345', false, 'invalid: three letters, five digits'],
    ['TC-EP-ID-05', 'AB12345', false, 'invalid: too few digits'],
    ['TC-EP-ID-06', 'AB1234567', false, 'invalid: too many digits'],
    ['TC-EP-ID-07', 'AB12 456', false, 'invalid: contains space'],
    ['TC-EP-ID-08', '', false, 'invalid: empty'],
    ['TC-EP-ID-09', undefined, false, 'invalid: missing'],
    ['TC-EP-ID-10', 12345678, false, 'invalid: not a string'],
    ['TC-EP-ID-11', '12345678', false, 'invalid: digits only'],
  ])('%s: %p -> valid=%p (%s)', (id, input, expected) => {
    expect(validateStudentId(input).valid).toBe(expected);
  });

  test('returns an error message for invalid input', () => {
    expect(validateStudentId('bad').error).toMatch(/two uppercase letters/);
    expect(validateStudentId('').error).toMatch(/required/);
  });
});

describe('validatePassword: BVA on length 8-20 (REQ-02)', () => {
  // Build a password of a given length that meets every character-class rule
  const make = (len) => ('Aa1!' + 'x'.repeat(Math.max(0, len - 4))).slice(0, len);

  test.each([
    ['TC-BVA-PW-01', 7, false],
    ['TC-BVA-PW-02', 8, true],
    ['TC-BVA-PW-03', 9, true],
    ['TC-BVA-PW-04', 19, true],
    ['TC-BVA-PW-05', 20, true],
    ['TC-BVA-PW-06', 21, false],
  ])('%s: length %i -> valid=%p', (id, len, expected) => {
    expect(validatePassword(make(len)).valid).toBe(expected);
  });
});

describe('validatePassword: EP on character classes (REQ-02)', () => {
  test('valid password passes with no errors', () => {
    expect(validatePassword('Passw0rd!')).toEqual({ valid: true, errors: [] });
  });

  test.each([
    ['TC-EP-PW-01', 'passw0rd!', /uppercase/],
    ['TC-EP-PW-02', 'PASSW0RD!', /lowercase/],
    ['TC-EP-PW-03', 'Password!', /digit/],
    ['TC-EP-PW-04', 'Passw0rd1', /special/],
  ])('%s: %p is rejected (%s)', (id, pw, pattern) => {
    const result = validatePassword(pw);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(pattern);
  });

  test.each([
    ['TC-EP-PW-05', ''],
    ['TC-EP-PW-06', undefined],
    ['TC-EP-PW-07', null],
    ['TC-EP-PW-08', 12345678],
  ])('%s: %p is rejected as required', (id, pw) => {
    const result = validatePassword(pw);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['Password is required']);
  });

  test('reports multiple errors together', () => {
    expect(validatePassword('abc').errors.length).toBeGreaterThanOrEqual(4);
  });
});
