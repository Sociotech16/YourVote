'use strict';

const { canTransition, STATES } = require('../../src/lib/electionState');

/**
 * Test design: State Transition Testing (REQ-11)
 * Every ordered pair of states is exercised (valid and invalid).
 */

const VALID = [
  ['Draft', 'Scheduled'],
  ['Scheduled', 'Open'],
  ['Scheduled', 'Draft'],
  ['Open', 'Closed'],
  ['Closed', 'ResultsPublished'],
];

describe('election lifecycle (REQ-11)', () => {
  test.each(VALID)('valid transition %s -> %s is allowed', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  const invalid = [];
  for (const from of STATES) {
    for (const to of STATES) {
      if (!VALID.some(([f, t]) => f === from && t === to)) invalid.push([from, to]);
    }
  }

  test.each(invalid)('invalid transition %s -> %s is rejected', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  test('unknown states are rejected', () => {
    expect(canTransition('Nope', 'Open')).toBe(false);
    expect(canTransition('Draft', 'Nope')).toBe(false);
    expect(canTransition(undefined, undefined)).toBe(false);
  });
});
