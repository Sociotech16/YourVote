'use strict';

/**
 * Vote counting (REQ-19).
 *
 * @param {Array<{positionId:string, candidateId:string}>} ballots
 * @param {Array<{id:string, positionId:string}>} candidates
 * @returns {{results: object, invalidBallots: number}}
 *   results[positionId] = { tallies: {candidateId: n}, total, winners: [ids], tie: boolean }
 * Ballots naming an unknown candidate, or a candidate from a different
 * position, are not counted and are reported in invalidBallots.
 */
function countVotes(ballots = [], candidates = []) {
  const results = {};
  const candidatePosition = new Map();

  for (const c of candidates) {
    candidatePosition.set(c.id, c.positionId);
    if (!results[c.positionId]) {
      results[c.positionId] = { tallies: {}, total: 0, winners: [], tie: false };
    }
    results[c.positionId].tallies[c.id] = 0;
  }

  let invalidBallots = 0;
  for (const b of ballots) {
    if (!b || candidatePosition.get(b.candidateId) !== b.positionId) {
      invalidBallots += 1;
      continue;
    }
    results[b.positionId].tallies[b.candidateId] += 1;
    results[b.positionId].total += 1;
  }

  for (const pos of Object.values(results)) {
    if (pos.total > 0) {
      const max = Math.max(...Object.values(pos.tallies));
      pos.winners = Object.keys(pos.tallies).filter((id) => pos.tallies[id] === max);
      pos.tie = pos.winners.length > 1;
    }
  }

  return { results, invalidBallots };
}

module.exports = { countVotes };
