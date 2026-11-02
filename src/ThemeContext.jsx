import { createContext, useContext, useState, useMemo } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  // Оптимизируем объект контекста с помощью useMemo
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

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
