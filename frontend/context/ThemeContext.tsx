import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Global theme state to sync across all components
let globalTheme: 'light' | 'dark' = 'light';
const themeListeners = new Set<(theme: 'light' | 'dark') => void>();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    globalTheme = initialTheme;
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      globalTheme = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      // Notify all listeners
      themeListeners.forEach((listener) => listener(newTheme));
      return newTheme;
    });
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  const [theme, setTheme] = useState<'light' | 'dark'>(globalTheme);

  useEffect(() => {
    const listener = (newTheme: 'light' | 'dark') => {
      setTheme(newTheme);
    };
    themeListeners.add(listener);
    return () => {
      themeListeners.delete(listener);
    };
  }, []);

  return {
    theme,
    toggleTheme: context.toggleTheme,
  };
}
