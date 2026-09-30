import { api } from '../api/mock';

beforeEach(() => localStorage.setItem('yv_user', JSON.stringify({ id: 'u1' })));
afterEach(() => localStorage.clear());

test('TC-MOCK-01 login rejects wrong credentials', async () => {
  await expect(api.login({ studentId: 'AB123456', password: 'nope' })).rejects.toThrow('Invalid student ID or password');
});

test('TC-MOCK-02 register rejects a duplicate student ID', async () => {
  await expect(api.register({ studentId: 'AB123456', name: 'X', faculty: 'Law', password: 'Passw0rd!' }))
    .rejects.toThrow('already registered');
});

test('TC-MOCK-03 search and status filters narrow the list', async () => {
  expect((await api.listElections({ search: 'science' })).map((e) => e.id)).toEqual(['e2']);
  expect((await api.listElections({ status: 'Open' })).map((e) => e.id)).toEqual(['e1']);
});

test('TC-MOCK-04 incomplete ballot is rejected', async () => {
  await expect(api.castVotes('e1', { p1: 'c1' })).rejects.toThrow('every position');
});

test('TC-MOCK-05 a second vote is rejected', async () => {
  await api.castVotes('e1', { p1: 'c1', p2: 'c4' });
  await expect(api.castVotes('e1', { p1: 'c1', p2: 'c4' })).rejects.toThrow('already voted');
});

test('TC-MOCK-06 voting in a non-open election is rejected', async () => {
  await expect(api.castVotes('e2', { p3: 'c6' })).rejects.toThrow('not open');
});

test('TC-MOCK-07 results are only available once published', async () => {
  await expect(api.getResults('e1')).rejects.toThrow('not been published');
  const r = await api.getResults('e3');
  expect(r.results[0].winners).toEqual(['Hannah Phiri']);
});
