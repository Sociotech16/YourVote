import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Vote() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api.getElection(id).then((e) => live && setElection(e)).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [id]);

  if (receipt) {
    return (
      <div className="card narrow">
        <h1>Vote recorded</h1>
        <p>Thank you for voting. Your receipt number is:</p>
        <p className="receipt">{receipt}</p>
        <Link className="btn" to="/elections">Back to elections</Link>
      </div>
    );
  }

  if (!election) return error ? <p role="alert" className="alert">{error}</p> : <p>Loading…</p>;

  const complete = election.positions.every((p) => selections[p.id]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.castVotes(id, selections);
      setReceipt(res.receipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h1>{election.title}</h1>
      {error && <p role="alert" className="alert">{error}</p>}
      {election.positions.map((p) => (
        <fieldset key={p.id}>
          <legend>{p.title}</legend>
          {p.candidates.map((c) => (
            <label key={c.id} className="option">
              <input type="radio" name={p.id} value={c.id} checked={selections[p.id] === c.id}
                onChange={() => setSelections({ ...selections, [p.id]: c.id })} />
              {c.name}
            </label>
          ))}
        </fieldset>
      ))}
      <button type="submit" disabled={!complete || busy}>{busy ? 'Submitting…' : 'Submit vote'}</button>
      {!complete && <p className="hint">Choose one candidate for every position to continue.</p>}
    </form>
  );
}
