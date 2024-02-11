import { LiteLogWritter } from './logger';

export type CleanConsole = {
  debug(...args: any[]): void;
  error(...args: any[]): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
};

export function spyConsole(logWritter: LiteLogWritter, { onlyErrors } = { onlyErrors: false }): CleanConsole {
  const cleanConsoleError = console.error.bind(console);
  const cleanConsoleLog = console.log.bind(console);
  const cleanConsoleWarn = console.warn.bind(console);
  const cleanConsoleDebug = console.debug.bind(console);

  console.error = (...args) => {
    logWritter.error(...args);
  };

  if (!onlyErrors) {
    console.log = (...args) => {
      logWritter.info(...args);
    };

    console.warn = (...args) => {
      logWritter.warn(...args);
    };

    console.debug = (...args) => {
      logWritter.debug(...args);
    };
  }

  return {
    debug: cleanConsoleDebug,
    error: cleanConsoleError,
    log: cleanConsoleLog,
    warn: cleanConsoleWarn,
  };
}
