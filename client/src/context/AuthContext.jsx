import { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('yv_user')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const signIn = useCallback(({ token, user: u }) => {
    localStorage.setItem('yv_token', token);
    localStorage.setItem('yv_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('yv_token');
    localStorage.removeItem('yv_user');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
