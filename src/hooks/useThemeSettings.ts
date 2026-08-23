import { useState, useEffect } from 'react';

export type ThemeConfig = {
  primary: string;
  secondary: string;
  pageBg?: string;
  cardBg?: string;
  headerBg?: string;
  textColor?: string;
  fontFamily: string;
  fontSize: number; // percentage, e.g. 100 for default
};

const DEFAULT_THEME: ThemeConfig = {
  primary: '#246fff',
  secondary: '#dfba6b',
  pageBg: '#f9fafb',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  textColor: '#111827',
  fontFamily: 'Cairo',
  fontSize: 100,
};

export const useThemeSettings = () => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const userStr = localStorage.getItem('current_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const key = user && user.id ? `app-theme-settings-${user.id}` : 'app-theme-settings';
      
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_THEME, ...parsed };
      }
      return DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    const userStr = localStorage.getItem('current_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const key = user && user.id ? `app-theme-settings-${user.id}` : 'app-theme-settings';
    
    localStorage.setItem(key, JSON.stringify(theme));
    
    // Apply variables to document root
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-font', theme.fontFamily);
    
    if (theme.pageBg) root.style.setProperty('--theme-page-bg', theme.pageBg);
    if (theme.cardBg) root.style.setProperty('--theme-card-bg', theme.cardBg);
    if (theme.headerBg) root.style.setProperty('--theme-header-bg', theme.headerBg);
    if (theme.textColor) root.style.setProperty('--theme-text', theme.textColor);
    
    // Apply font size scale
    root.style.fontSize = `${theme.fontSize}%`;
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return { theme, updateTheme };
};
