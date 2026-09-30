import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, isMock } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validateStudentId } from '../lib/validators';
import Field from '../components/Field';

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    const id = validateStudentId(studentId);
    if (!id.valid) errs.studentId = id.error;
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      signIn(await api.login({ studentId, password }));
      navigate('/elections');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={onSubmit} noValidate>
      <h1>Log in</h1>
      {isMock && <p className="hint">Demo account: AB123456 / Passw0rd!</p>}
      {serverError && <p role="alert" className="alert">{serverError}</p>}
      <Field id="studentId" label="Student ID" value={studentId} error={errors.studentId}
        onChange={(e) => setStudentId(e.target.value)} autoComplete="username" />
      <Field id="password" label="Password" type="password" value={password} error={errors.password}
        onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      <button type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <p>No account? <Link to="/register">Register</Link></p>
    </form>
  );
}
