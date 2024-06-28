import { LiteLogType, LiteLogWritter } from './logger';

export type IConsole = {
  debug(...args: any[]): void;
  error(...args: any[]): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
};

export function writeLogArgsInConsole(consoleImpl: IConsole, type: LiteLogType, logArgs: unknown[]) {
  switch (type) {
    case 'ERROR':
      consoleImpl.error(...logArgs);
      break;
    case 'WARNING':
      consoleImpl.warn(...logArgs);
      break;
    case 'INFO':
      consoleImpl.log(...logArgs);
      break;
    case 'DEBUG':
      consoleImpl.debug(...logArgs);
      break;
  }
}

export function spyConsole(logWritter: LiteLogWritter, { onlyErrors } = { onlyErrors: false }): IConsole {
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
