import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import { api } from '../api/client';

vi.mock('../api/client', () => ({ api: { login: vi.fn() }, isMock: false }));

function setup() {
  render(<MemoryRouter><AuthProvider><Login /></AuthProvider></MemoryRouter>);
  return userEvent.setup();
}

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

test('TC-UI-01 invalid student ID shows a message and does not call the API', async () => {
  const user = setup();
  await user.type(screen.getByLabelText(/student id/i), 'bad');
  await user.type(screen.getByLabelText(/password/i), 'x');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(await screen.findByText(/two uppercase letters/i)).toBeInTheDocument();
  expect(api.login).not.toHaveBeenCalled();
});

test('TC-UI-02 empty password shows a required message', async () => {
  const user = setup();
  await user.type(screen.getByLabelText(/student id/i), 'AB123456');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
});

test('TC-UI-03 valid credentials call the API and store the session', async () => {
  api.login.mockResolvedValue({ token: 't', user: { id: 'u1', name: 'Demo' } });
  const user = setup();
  await user.type(screen.getByLabelText(/student id/i), 'AB123456');
  await user.type(screen.getByLabelText(/password/i), 'Passw0rd!');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(api.login).toHaveBeenCalledWith({ studentId: 'AB123456', password: 'Passw0rd!' });
  expect(localStorage.getItem('yv_token')).toBe('t');
});

test('TC-UI-04 a server error is announced to the user', async () => {
  api.login.mockRejectedValue(new Error('Invalid student ID or password'));
  const user = setup();
  await user.type(screen.getByLabelText(/student id/i), 'AB123456');
  await user.type(screen.getByLabelText(/password/i), 'Wrong1!x');
  await user.click(screen.getByRole('button', { name: /log in/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid student ID or password');
});
