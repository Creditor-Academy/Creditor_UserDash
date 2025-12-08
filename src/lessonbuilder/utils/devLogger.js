// Lightweight dev-only logger to avoid missing import failures
const isDev =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.DEV) ||
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV !== 'production');

const logIfDev = (method, ...args) => {
  if (!isDev) return;
  const logger = console[method] || console.log;
  logger('[LessonBuilder]', ...args);
};

const devLogger = {
  debug: (...args) => logIfDev('debug', ...args),
  info: (...args) => logIfDev('info', ...args),
  warn: (...args) => logIfDev('warn', ...args),
  error: (...args) => logIfDev('error', ...args),
};

export default devLogger;
