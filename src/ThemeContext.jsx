import { createContext, useContext, useState, useEffect } from 'react';

const ThemeCtx = createContext({ mode: 'light', toggleTheme: () => {} });

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode(m => m === 'light' ? 'dark' : 'light');

  return (
    <ThemeCtx.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeCtx);
