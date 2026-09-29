'use strict';

const { canVote, REASONS } = require('../../src/lib/canVote');

/**
 * Test design: Decision Table Testing + BVA on the voting window
 * Requirements: REQ-12, REQ-13, REQ-14
 *
 * Conditions (evaluated in this priority order):
 *   C1 authenticated   C2 registered voter   C3 faculty eligible
 *   C4 election open   C5 within window      C6 not already voted
 *
 * Rule | C1 C2 C3 C4 C5 C6 | Outcome
 *  R1  | N  -  -  -  -  -  | NOT_AUTHENTICATED
 *  R2  | Y  N  -  -  -  -  | NOT_REGISTERED
 *  R3  | Y  Y  N  -  -  -  | FACULTY_NOT_ELIGIBLE
 *  R4  | Y  Y  Y  N  -  -  | ELECTION_NOT_OPEN
 *  R5  | Y  Y  Y  Y  N  -  | OUTSIDE_VOTING_WINDOW
 *  R6  | Y  Y  Y  Y  Y  N  | ALREADY_VOTED
 *  R7  | Y  Y  Y  Y  Y  Y  | OK (allowed)
 */

const START = '2026-10-01T08:00:00.000Z';
const END = '2026-10-01T17:00:00.000Z';
const INSIDE = '2026-10-01T12:00:00.000Z';

const user = (over = {}) => ({ id: 'u1', role: 'voter', isRegistered: true, faculty: 'Engineering', ...over });
const election = (over = {}) => ({
  status: 'Open',
  startTime: START,
  endTime: END,
  eligibleFaculties: ['Engineering', 'Science'],
  ...over,
});
const ctx = (over = {}) => ({ user: user(), election: election(), hasVoted: false, now: INSIDE, ...over });

describe('canVote: decision table (REQ-12, REQ-13)', () => {
  test.each([
    ['TC-DT-01 (R1)', { user: null }, false, REASONS.NOT_AUTHENTICATED],
    ['TC-DT-02 (R2)', { user: user({ isRegistered: false }) }, false, REASONS.NOT_REGISTERED],
    ['TC-DT-03 (R3)', { user: user({ faculty: 'Law' }) }, false, REASONS.FACULTY_NOT_ELIGIBLE],
    ['TC-DT-04 (R4)', { election: election({ status: 'Closed' }) }, false, REASONS.ELECTION_NOT_OPEN],
    ['TC-DT-05 (R5)', { now: '2026-10-02T09:00:00.000Z' }, false, REASONS.OUTSIDE_VOTING_WINDOW],
    ['TC-DT-06 (R6)', { hasVoted: true }, false, REASONS.ALREADY_VOTED],
    ['TC-DT-07 (R7)', {}, true, REASONS.OK],
  ])('%s', (name, over, allowed, reason) => {
    expect(canVote(ctx(over))).toEqual({ allowed, reason });
  });
});

describe('canVote: additional partitions', () => {
  test('user object without an id is not authenticated', () => {
    expect(canVote(ctx({ user: user({ id: undefined }) })).reason).toBe(REASONS.NOT_AUTHENTICATED);
  });

  test('admins cannot vote', () => {
    expect(canVote(ctx({ user: user({ role: 'admin' }) })).reason).toBe(REASONS.NOT_REGISTERED);
  });

  test('missing election is reported', () => {
    expect(canVote(ctx({ election: null })).reason).toBe(REASONS.ELECTION_NOT_FOUND);
  });

  test('election open to all faculties when the list is empty', () => {
    expect(canVote(ctx({ election: election({ eligibleFaculties: [] }), user: user({ faculty: 'Law' }) })).allowed).toBe(true);
  });

  test('election open to all faculties when the list is absent', () => {
    expect(canVote(ctx({ election: election({ eligibleFaculties: undefined }) })).allowed).toBe(true);
  });

  test('called with no arguments is treated as unauthenticated', () => {
    expect(canVote().reason).toBe(REASONS.NOT_AUTHENTICATED);
  });

  test('priority: unregistered AND already voted reports NOT_REGISTERED first', () => {
    expect(canVote(ctx({ user: user({ isRegistered: false }), hasVoted: true })).reason).toBe(REASONS.NOT_REGISTERED);
  });

  test('priority: closed election AND outside window reports ELECTION_NOT_OPEN first', () => {
    const res = canVote(ctx({ election: election({ status: 'Closed' }), now: '2027-01-01T00:00:00Z' }));
    expect(res.reason).toBe(REASONS.ELECTION_NOT_OPEN);
  });
});

describe('canVote: BVA on the voting window (REQ-14)', () => {
  const at = (iso) => canVote(ctx({ now: iso }));

  test.each([
    ['TC-BVA-VW-01 start - 1s', '2026-10-01T07:59:59.000Z', false],
    ['TC-BVA-VW-02 start', START, true],
    ['TC-BVA-VW-03 start + 1s', '2026-10-01T08:00:01.000Z', true],
    ['TC-BVA-VW-04 end - 1s', '2026-10-01T16:59:59.000Z', true],
    ['TC-BVA-VW-05 end', END, false],
    ['TC-BVA-VW-06 end + 1s', '2026-10-01T17:00:01.000Z', false],
  ])('%s', (name, iso, allowed) => {
    const res = at(iso);
    expect(res.allowed).toBe(allowed);
    if (!allowed) expect(res.reason).toBe(REASONS.OUTSIDE_VOTING_WINDOW);
  });

  test('accepts Date objects and epoch milliseconds for now', () => {
    expect(canVote(ctx({ now: new Date(INSIDE) })).allowed).toBe(true);
    expect(canVote(ctx({ now: new Date(INSIDE).getTime() })).allowed).toBe(true);
  });

  test('invalid dates are treated as outside the window', () => {
    expect(canVote(ctx({ now: 'not-a-date' })).reason).toBe(REASONS.OUTSIDE_VOTING_WINDOW);
    expect(canVote(ctx({ election: election({ startTime: 'bad' }) })).reason).toBe(REASONS.OUTSIDE_VOTING_WINDOW);
    expect(canVote(ctx({ election: election({ endTime: undefined }) })).reason).toBe(REASONS.OUTSIDE_VOTING_WINDOW);
  });
});
