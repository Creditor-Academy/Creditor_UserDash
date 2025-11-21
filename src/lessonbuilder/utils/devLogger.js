/**
 * Development logger helper; keeps the console clean in production builds.
 */
const isDevelopment = !!import.meta.env?.DEV;

const devLogger = {
  debug: (...args) => {
    if (isDevelopment) console.debug(...args);
  },
  info: (...args) => {
    if (isDevelopment) console.info(...args);
  },
  warn: (...args) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args) => {
    if (isDevelopment) console.error(...args);
  },
};

export default devLogger;
