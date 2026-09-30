// In-browser stand-in for the API routes that do not exist yet.
// Follows the same contract as the real client in client.js.
import { validateStudentId, validatePassword } from '../lib/validators';

const wait = () => new Promise((r) => setTimeout(r, 40));
const person = (id, name) => ({ id, name });

const users = [{ id: 'u1', studentId: 'AB123456', name: 'Demo Voter', faculty: 'Engineering', password: 'Passw0rd!' }];

const elections = [
  {
    id: 'e1', title: 'SRC Elections 2026', status: 'Open',
    startTime: '2026-09-28T08:00:00Z', endTime: '2026-10-31T17:00:00Z',
    positions: [
      { id: 'p1', title: 'President', candidates: [person('c1', 'Alice Carter'), person('c2', 'Brian Moyo'), person('c3', 'Chloe Ncube')] },
      { id: 'p2', title: 'Treasurer', candidates: [person('c4', 'David Dube'), person('c5', 'Esther Sithole')] },
    ],
  },
  {
    id: 'e2', title: 'Science Faculty Representative 2026', status: 'Scheduled',
    startTime: '2026-11-10T08:00:00Z', endTime: '2026-11-12T17:00:00Z',
    positions: [{ id: 'p3', title: 'Science Representative', candidates: [person('c6', 'Farai Zulu'), person('c7', 'Grace Mlambo')] }],
  },
  {
    id: 'e3', title: 'SRC Elections 2025', status: 'ResultsPublished',
    startTime: '2025-10-01T08:00:00Z', endTime: '2025-10-03T17:00:00Z',
    positions: [{ id: 'p4', title: 'President', candidates: [person('c8', 'Hannah Phiri'), person('c9', 'Ian Banda')] }],
  },
];

const baseline = { c8: 412, c9: 377 };
const ballots = [];
const voted = new Set();

const currentUser = () => {
  try { return JSON.parse(localStorage.getItem('yv_user')); } catch { return null; }
};
const publicUser = (u) => ({ id: u.id, studentId: u.studentId, name: u.name, faculty: u.faculty, role: 'voter' });
const session = (u) => ({ token: `mock-${u.id}`, user: publicUser(u) });
const findElection = (id) => {
  const e = elections.find((x) => x.id === id);
  if (!e) throw new Error('Election not found');
  return e;
};

export const api = {
  async register({ studentId, name, faculty, password }) {
    await wait();
    const id = validateStudentId(studentId);
    if (!id.valid) throw new Error(id.error);
    const pw = validatePassword(password);
    if (!pw.valid) throw new Error(pw.errors[0]);
    if (users.some((u) => u.studentId === studentId)) throw new Error('Student ID already registered');
    const user = { id: `u${users.length + 1}`, studentId, name, faculty, password };
    users.push(user);
    return session(user);
  },

  async login({ studentId, password }) {
    await wait();
    const user = users.find((u) => u.studentId === studentId && u.password === password);
    if (!user) throw new Error('Invalid student ID or password');
    return session(user);
  },

  async listElections({ search = '', status = '' } = {}) {
    await wait();
    const q = search.trim().toLowerCase();
    return elections.filter((e) => (!q || e.title.toLowerCase().includes(q)) && (!status || e.status === status));
  },

  async getElection(id) {
    await wait();
    return findElection(id);
  },

  async castVotes(id, selections) {
    await wait();
    const user = currentUser();
    if (!user) throw new Error('Please log in to vote');
    const election = findElection(id);
    if (election.status !== 'Open') throw new Error('This election is not open for voting');
    const key = `${user.id}:${id}`;
    if (voted.has(key)) throw new Error('You have already voted in this election');
    const complete = election.positions.every((p) => p.candidates.some((c) => c.id === selections[p.id]));
    if (!complete) throw new Error('Select a candidate for every position');
    election.positions.forEach((p) => ballots.push({ electionId: id, positionId: p.id, candidateId: selections[p.id] }));
    voted.add(key);
    return { receipt: `YV-${Math.random().toString(36).slice(2, 10).toUpperCase()}` };
  },

  async getResults(id) {
    await wait();
    const election = findElection(id);
    if (election.status !== 'ResultsPublished') throw new Error('Results have not been published yet');
    const results = election.positions.map((p) => {
      const tallies = p.candidates.map((c) => ({
        candidateId: c.id,
        name: c.name,
        votes: (baseline[c.id] || 0) + ballots.filter((b) => b.candidateId === c.id).length,
      }));
      const total = tallies.reduce((s, t) => s + t.votes, 0);
      const max = Math.max(...tallies.map((t) => t.votes));
      const winners = total > 0 ? tallies.filter((t) => t.votes === max).map((t) => t.name) : [];
      return { positionId: p.id, title: p.title, tallies, total, winners, tie: winners.length > 1 };
    });
    return { election: { id: election.id, title: election.title }, results };
  },
};
