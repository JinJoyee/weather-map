const isDev = import.meta.env.DEV;

const logger = {
  info:  (...args) => isDev && console.log('[INFO]', ...args),
  warn:  (...args) => isDev && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

export default logger;
