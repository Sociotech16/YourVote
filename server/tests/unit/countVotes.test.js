'use strict';

const { countVotes } = require('../../src/lib/countVotes');

/** Test design: statement and branch coverage of vote counting (REQ-19) */

const candidates = [
  { id: 'c1', positionId: 'president' },
  { id: 'c2', positionId: 'president' },
  { id: 'c3', positionId: 'treasurer' },
  { id: 'c4', positionId: 'treasurer' },
];
const ballot = (positionId, candidateId) => ({ positionId, candidateId });

describe('countVotes (REQ-19)', () => {
  test('TC-CV-01 counts votes per candidate and identifies the winner', () => {
    const ballots = [
      ballot('president', 'c1'), ballot('president', 'c1'), ballot('president', 'c2'),
      ballot('treasurer', 'c4'),
    ];
    const { results, invalidBallots } = countVotes(ballots, candidates);
    expect(invalidBallots).toBe(0);
    expect(results.president).toEqual({ tallies: { c1: 2, c2: 1 }, total: 3, winners: ['c1'], tie: false });
    expect(results.treasurer.winners).toEqual(['c4']);
  });

  test('TC-CV-02 detects a tie', () => {
    const { results } = countVotes([ballot('president', 'c1'), ballot('president', 'c2')], candidates);
    expect(results.president.tie).toBe(true);
    expect(results.president.winners.sort()).toEqual(['c1', 'c2']);
  });

  test('TC-CV-03 no votes: zero tallies, no winner, no tie', () => {
    const { results } = countVotes([], candidates);
    expect(results.president).toEqual({ tallies: { c1: 0, c2: 0 }, total: 0, winners: [], tie: false });
  });

  test('TC-CV-04 ballot for an unknown candidate is invalid', () => {
    const { results, invalidBallots } = countVotes([ballot('president', 'ghost')], candidates);
    expect(invalidBallots).toBe(1);
    expect(results.president.total).toBe(0);
  });

  test('TC-CV-05 ballot with a candidate from a different position is invalid', () => {
    const { invalidBallots, results } = countVotes([ballot('treasurer', 'c1')], candidates);
    expect(invalidBallots).toBe(1);
    expect(results.treasurer.total).toBe(0);
  });

  test('TC-CV-06 null ballots are invalid', () => {
    expect(countVotes([null, undefined], candidates).invalidBallots).toBe(2);
  });

  test('TC-CV-07 defaults: no arguments returns empty results', () => {
    expect(countVotes()).toEqual({ results: {}, invalidBallots: 0 });
  });
});
