import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import Vote from './pages/Vote';
import Results from './pages/Results';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/elections" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="elections" element={<RequireAuth><Elections /></RequireAuth>} />
        <Route path="elections/:id/vote" element={<RequireAuth><Vote /></RequireAuth>} />
        <Route path="elections/:id/results" element={<RequireAuth><Results /></RequireAuth>} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Route>
    </Routes>
  );
}
