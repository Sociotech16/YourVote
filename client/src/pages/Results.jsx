import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    api.getResults(id).then((d) => live && setData(d)).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [id]);

  if (error) return <p role="alert" className="alert">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <section>
      <h1>{data.election.title}: results</h1>
      {data.results.map((r) => (
        <div key={r.positionId} className="card">
          <h2>{r.title}</h2>
          {r.tallies.map((t) => (
            <div key={t.candidateId} className="bar-row">
              <span>{t.name}</span>
              <div className="bar" aria-hidden="true">
                <div style={{ width: `${r.total ? (t.votes / r.total) * 100 : 0}%` }} />
              </div>
              <span>{t.votes} votes</span>
            </div>
          ))}
          <p>{r.tie ? `Tie between ${r.winners.join(' and ')}` : r.winners.length ? `Winner: ${r.winners[0]}` : 'No votes cast'}</p>
        </div>
      ))}
      <Link to="/elections">Back to elections</Link>
    </section>
  );
}
