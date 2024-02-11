import { LiteEvent } from '@/reactive';
import { LiteLogger, LiteLogEvent, LiteLoggerParams } from './logger';
import { CleanConsole, spyConsole } from './spy-console';

export type FactoryFnLoggerParams = Partial<Omit<LiteLoggerParams, 'logEvent' | 'executorOffset'>>;
export function createLoggerFactoryFn(appLogger: LiteLogger) {
  return (params: FactoryFnLoggerParams = {}) => {
    return new LiteLogger({
      ...params,
      logEvent: appLogger.logEvent,
    });
  };
}

export type AppLoggerParams = {
  catchFatalErrors: (handler: (text: string) => void) => void;
  handleLogEvent: (logEvent: LiteLogEvent) => void;
};
export function createAppLogger({ catchFatalErrors, handleLogEvent }: Partial<AppLoggerParams>): {
  appLogger: LiteLogger;
  cleanConsole: CleanConsole;
} {
  const appLogger = new LiteLogger();
  if (catchFatalErrors) {
    catchFatalErrors(appLogger.error);
  }

  const cleanConsole = _spyConsole(appLogger.logEvent);
  _handleLogEvent({
    logEvent: appLogger.logEvent,
    cleanConsole,
    handleLogEvent,
  });

  return { appLogger, cleanConsole };
}

function _spyConsole(logEvent: LiteEvent<LiteLogEvent>) {
  const spyLogger = new LiteLogger({
    logEvent,
    executorOffset: 1,
    loggerName: 'spy',
  });
  return spyConsole(spyLogger);
}

function _handleLogEvent({
  logEvent,
  handleLogEvent,
  cleanConsole,
}: {
  logEvent: LiteEvent<LiteLogEvent>;
  cleanConsole?: CleanConsole;
  handleLogEvent?: (logEvent: LiteLogEvent) => void;
}) {
  logEvent.on((event) => {
    const { type, text } = event;
    switch (type) {
      case 'DEBUG':
        cleanConsole?.debug(text);
        break;
      case 'INFO':
        cleanConsole?.log(text);
        break;
      case 'WARNING':
        cleanConsole?.warn(text);
        break;
      case 'ERROR':
        cleanConsole?.error(text);
        break;
    }
    if (handleLogEvent) {
      handleLogEvent(event);
    }
  });
}
