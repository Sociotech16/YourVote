'use strict';

/**
 * Voting eligibility (REQ-12, REQ-13, REQ-14).
 *
 * Pure function: no database, no clock. The caller supplies `now`.
 * Rules are evaluated in a fixed priority order, so exactly one reason is
 * returned. This order is the one used in the decision table.
 *
 * Voting window: start is inclusive, end is exclusive (REQ-14).
 *
 * @param {object} ctx
 * @param {object|null} ctx.user      { id, role, isRegistered, faculty }
 * @param {object|null} ctx.election  { status, startTime, endTime, eligibleFaculties }
 *                                    empty/absent eligibleFaculties = all faculties
 * @param {boolean} ctx.hasVoted      voter already voted in this election/position
 * @param {Date|number|string} ctx.now
 * @returns {{allowed: boolean, reason: string}}
 */

const REASONS = Object.freeze({
  OK: 'OK',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  NOT_REGISTERED: 'NOT_REGISTERED',
  ELECTION_NOT_FOUND: 'ELECTION_NOT_FOUND',
  FACULTY_NOT_ELIGIBLE: 'FACULTY_NOT_ELIGIBLE',
  ELECTION_NOT_OPEN: 'ELECTION_NOT_OPEN',
  OUTSIDE_VOTING_WINDOW: 'OUTSIDE_VOTING_WINDOW',
  ALREADY_VOTED: 'ALREADY_VOTED',
});

function reject(reason) {
  return { allowed: false, reason };
}

function canVote({ user, election, hasVoted, now } = {}) {
  if (!user || !user.id) return reject(REASONS.NOT_AUTHENTICATED);
  if (user.role !== 'voter' || !user.isRegistered) return reject(REASONS.NOT_REGISTERED);
  if (!election) return reject(REASONS.ELECTION_NOT_FOUND);

  const faculties = election.eligibleFaculties;
  if (Array.isArray(faculties) && faculties.length > 0 && !faculties.includes(user.faculty)) {
    return reject(REASONS.FACULTY_NOT_ELIGIBLE);
  }

  if (election.status !== 'Open') return reject(REASONS.ELECTION_NOT_OPEN);

  const t = new Date(now).getTime();
  const start = new Date(election.startTime).getTime();
  const end = new Date(election.endTime).getTime();
  if (Number.isNaN(t) || Number.isNaN(start) || Number.isNaN(end) || t < start || t >= end) {
    return reject(REASONS.OUTSIDE_VOTING_WINDOW);
  }

  if (hasVoted) return reject(REASONS.ALREADY_VOTED);

  return { allowed: true, reason: REASONS.OK };
}

module.exports = { canVote, REASONS };
