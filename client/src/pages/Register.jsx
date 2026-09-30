import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateStudentId } from '../lib/validators';
import Field from '../components/Field';

const FACULTIES = ['Engineering', 'Science', 'Arts', 'Law', 'Commerce'];

export default function Register() {
  const [form, setForm] = useState({ studentId: '', name: '', faculty: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    const id = validateStudentId(form.studentId);
    if (!id.valid) errs.studentId = id.error;
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.faculty) errs.faculty = 'Select your faculty';
    const pw = validatePassword(form.password);
    if (!pw.valid) errs.password = pw.errors[0];
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const { studentId, name, faculty, password } = form;
      signIn(await api.register({ studentId, name: name.trim(), faculty, password }));
      navigate('/elections');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={onSubmit} noValidate>
      <h1>Register</h1>
      {serverError && <p role="alert" className="alert">{serverError}</p>}
      <Field id="studentId" label="Student ID" value={form.studentId} error={errors.studentId} onChange={set('studentId')} />
      <Field id="name" label="Full name" value={form.name} error={errors.name} onChange={set('name')} />
      <Field id="faculty" label="Faculty" error={errors.faculty}>
        <select id="faculty" value={form.faculty} onChange={set('faculty')}>
          <option value="">Select…</option>
          {FACULTIES.map((f) => <option key={f}>{f}</option>)}
        </select>
      </Field>
      <Field id="password" label="Password" type="password" value={form.password} error={errors.password} onChange={set('password')} />
      <Field id="confirm" label="Confirm password" type="password" value={form.confirm} error={errors.confirm} onChange={set('confirm')} />
      <p className="hint">8–20 characters with upper and lower case, a digit and a special character.</p>
      <button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      <p>Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
