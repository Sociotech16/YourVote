import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isMock } from '../api/client';
import HealthBadge from './HealthBadge';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <Link to="/" className="brand">YourVote</Link>
        <nav aria-label="Main">
          {user ? (
            <>
              <Link to="/elections">Elections</Link>
              <span className="who">{user.name}</span>
              <button className="link" onClick={() => { signOut(); navigate('/login'); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
        <div className="badges">
          {isMock && <span className="badge mock">Demo data</span>}
          <HealthBadge />
        </div>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}
