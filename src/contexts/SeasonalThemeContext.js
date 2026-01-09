import { createContext } from "react";

const defaultValue = {
  activeTheme: "newYear", // 'default' | 'newYear'
  setTheme: () => {},
};

export const SeasonalThemeContext = createContext(defaultValue);

export default SeasonalThemeContext;
