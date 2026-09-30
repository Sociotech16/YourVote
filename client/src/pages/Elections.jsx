import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const STATUSES = ['Scheduled', 'Open', 'Closed', 'ResultsPublished'];
const fmt = (d) => new Date(d).toLocaleString();

export default function Elections() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    setError('');
    api.listElections({ search, status })
      .then((data) => live && setItems(data))
      .catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [search, status]);

  return (
    <section>
      <h1>Elections</h1>
      <div className="filters">
        <label>Search
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Election name" />
        </label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {error && <p role="alert" className="alert">{error}</p>}
      {!items && !error && <p>Loading…</p>}
      {items && items.length === 0 && <p>No elections match your search.</p>}

      <ul className="list">
        {items && items.map((e) => (
          <li key={e.id} className="card">
            <h2>{e.title}</h2>
            <span className={`badge status-${e.status}`}>{e.status}</span>
            <p>{fmt(e.startTime)} to {fmt(e.endTime)}</p>
            {e.status === 'Open' && <Link className="btn" to={`/elections/${e.id}/vote`}>Vote now</Link>}
            {e.status === 'ResultsPublished' && <Link className="btn" to={`/elections/${e.id}/results`}>View results</Link>}
          </li>
        ))}
      </ul>
    </section>
  );
}
