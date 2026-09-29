'use strict';

/**
 * Election lifecycle (REQ-11):
 * Draft -> Scheduled -> Open -> Closed -> ResultsPublished
 * A Scheduled election may return to Draft for editing. No other backward moves.
 */

const STATES = ['Draft', 'Scheduled', 'Open', 'Closed', 'ResultsPublished'];

const TRANSITIONS = {
  Draft: ['Scheduled'],
  Scheduled: ['Open', 'Draft'],
  Open: ['Closed'],
  Closed: ['ResultsPublished'],
  ResultsPublished: [],
};

function canTransition(from, to) {
  if (!STATES.includes(from) || !STATES.includes(to)) return false;
  return TRANSITIONS[from].includes(to);
}

module.exports = { STATES, TRANSITIONS, canTransition };
