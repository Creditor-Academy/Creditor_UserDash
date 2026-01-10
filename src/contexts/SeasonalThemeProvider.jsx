import React, { useState, useEffect } from 'react';
import { SeasonalThemeContext } from './SeasonalThemeContext';
import { seasonalThemeConfig as config } from '@/config/seasonalThemeConfig';

export function SeasonalThemeProvider({ children }) {
  // Start with 'default' theme - user can click button to apply seasonal theme
  const [activeTheme, setActiveThemeState] = useState('default');

  // Load theme from localStorage if available (user preference)
  // Only load if theme system is enabled
  useEffect(() => {
    if (config.isEnabled) {
      const savedTheme = localStorage.getItem('seasonalTheme');
      if (savedTheme) {
        setActiveThemeState(savedTheme);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  const handleSetTheme = (theme) => {
    setActiveThemeState(theme);
    localStorage.setItem('seasonalTheme', theme);
  };

  // Get the effective theme based on isEnabled flag
  // If disabled, always return 'default' regardless of activeTheme
  const getEffectiveTheme = () => {
    if (!config.isEnabled) {
      return 'default';
    }
    return activeTheme;
  };

  const value = {
    // Always expose the actual activeTheme for reference
    activeTheme: getEffectiveTheme(),
    // Expose the raw activeTheme (for admin/debugging purposes)
    rawActiveTheme: activeTheme,
    // Expose whether theme system is enabled
    isEnabled: config.isEnabled,
    // Theme setter (only works when enabled)
    setTheme: (theme) => {
      if (config.isEnabled) {
        handleSetTheme(theme);
      }
    },
  };

  return (
    <SeasonalThemeContext.Provider value={value}>
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export default SeasonalThemeProvider;
