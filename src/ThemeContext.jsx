import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  // Для React 19 используется <ThemeContext value={value}>. 
  // Если у вас React 18 или ниже, замените на <ThemeContext.Provider value={value}>
  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme нужно вызывать внутри ThemeProvider');
  return ctx;
}
