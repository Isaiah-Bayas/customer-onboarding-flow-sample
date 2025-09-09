import React, { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(email, password) {
    // uid = email for simplicity
    const u = { uid: email.replace(/[^a-zA-Z0-9]/g, '_'), email };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
