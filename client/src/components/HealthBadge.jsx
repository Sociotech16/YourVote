import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function HealthBadge() {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let live = true;
    api.health().then(() => live && setState('online')).catch(() => live && setState('offline'));
    return () => { live = false; };
  }, []);

  const text = { checking: 'Checking API…', online: 'API online', offline: 'API offline (may be waking up)' }[state];
  return <span className={`badge health-${state}`} role="status">{text}</span>;
}
