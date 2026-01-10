import { createContext } from 'react';

const defaultValue = {
  activeTheme: 'active', // 'default' | 'newYear' | 'winter' | 'christmas' | etc.
  rawActiveTheme: 'default', // The actual theme value (not affected by isEnabled)
  isEnabled: false, // Whether seasonal theming is globally enabled
  setTheme: () => {}, // Function to change theme
};

export const SeasonalThemeContext = createContext(defaultValue);

export default SeasonalThemeContext;

