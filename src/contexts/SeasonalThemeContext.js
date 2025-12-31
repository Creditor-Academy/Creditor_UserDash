import { createContext } from 'react';

const defaultValue = {
  activeTheme: 'default', // 'default' | 'newYear'
  setTheme: () => {},
};

export const SeasonalThemeContext = createContext(defaultValue);

export default SeasonalThemeContext;
