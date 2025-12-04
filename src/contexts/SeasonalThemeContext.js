import { createContext } from 'react';

const defaultValue = {
  isChristmasMode: false,
  toggleChristmasMode: () => {},
};

export const SeasonalThemeContext = createContext(defaultValue);

export default SeasonalThemeContext;
