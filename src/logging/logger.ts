import { LiteAutoBind } from '@/auto-bind';

export type LiteLogType = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export type LiteLogEvent<PayloadT = any> = {
  type: LiteLogType;
  timestamp: string;
  link: string;
  executor: string;
  loggerName: string;
  logPrefix: string;
  logSuffix: string;
  logArgs: any[];
  payload?: PayloadT;
};

export type LiteLogWritter = {
  debug(...args: any[]): void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export const logArgToString = (arg: unknown) => {
  let newArg: string = '(Not processed arg)!!!';
  if (arg instanceof Error) {
    newArg = `\r\n ${arg.name}` + `\tMessage: ${arg.message}\r\n` + `\tStack: ${arg.stack}\r\n`;
  } else if (typeof arg === 'object') {
    try {
      newArg = JSON.stringify(arg, null, 4);
    } catch (err: any) {
      newArg = `(Stringify err: ${err?.message})!!!`;
    }
  } else if (typeof arg === 'string') {
    newArg = arg;
  } else if (typeof arg?.toString === 'function') {
    newArg = arg.toString();
  } else {
    newArg = String(arg);
  }
  return newArg;
};

export function logArgsToString(args: any[]): string {
  return args.map(logArgToString).join(' ');
}

export function logEventToLogArgs({
  timestamp,
  type,
  link,
  loggerName,
  executor,
  logArgs,
  logPrefix,
  logSuffix,
}: LiteLogEvent): any[] {
  const strIsNotEmpty = (s: string) => s !== '';

  const name = loggerName ? `<${loggerName}>` : '';
  const codeExecutor = executor ? `(${executor})` : '';
  const startLine = [timestamp, type, name, codeExecutor].filter(strIsNotEmpty).join(' ') + '\r\n';

  const prefix = logPrefix || '';
  const suffix = logSuffix || '';
  const middleLineArgs = [prefix, ...logArgs, suffix].filter(strIsNotEmpty);

  const endLineOrNextLineChar = link ? `\r\n${link}\r\n` : '\r\n';

  const args = [startLine, ...middleLineArgs, endLineOrNextLineChar];
  return args;
}

export function logEventToString(logEvent: LiteLogEvent) {
  return logArgsToString(logEventToLogArgs(logEvent));
}

export type LiteLoggerParams<PayloadT = any> = {
  handleLog?: (logEvent: LiteLogEvent) => void;
  executorOffset?: number;
  loggerName?: string;
  logPrefix?: string;
  logSuffix?: string;
  payload?: PayloadT;
};

export class LiteLogger<PayloadT = any> extends LiteAutoBind implements LiteLogWritter {
  private readonly handleLog: (logEvent: LiteLogEvent) => void = () => {};
  private readonly executorOffset: number = 0;
  private readonly loggerName: string = '';
  private readonly logPrefix: string = '';
  private readonly logSuffix: string = '';
  private readonly payload: PayloadT | undefined = undefined;

  constructor(params: LiteLoggerParams<PayloadT> = {}) {
    super();
    this.handleLog = params.handleLog || this.handleLog;
    this.executorOffset = params.executorOffset || this.executorOffset;
    this.loggerName = params.loggerName || this.loggerName;
    this.logPrefix = params.logPrefix || this.logPrefix;
    this.logSuffix = params.logSuffix || this.logSuffix;
    this.payload = params.payload || this.payload;
  }

  debug(...args: any[]): void {
    this.handle('DEBUG', ...args);
  }

  error(...args: any[]): void {
    this.handle('ERROR', ...args);
  }

  info(...args: any[]): void {
    this.handle('INFO', ...args);
  }

  warn(...args: any[]): void {
    this.handle('WARNING', ...args);
  }

  private handle(type: LiteLogType, ...args: any[]): void {
    const { executor, link } = this.getExecutorInfo();
    const timestamp = this.getLogCurrentTimestamp();

    this.handleLog({
      type,
      timestamp,
      executor,
      link,
      logArgs: args,
      loggerName: this.loggerName,
      logPrefix: this.logPrefix,
      logSuffix: this.logSuffix,
      payload: this.payload,
    });
  }

  private getLogCurrentTimestamp() {
    const addZeroFilter = (num: string): string => {
      return num.length === 1 ? '0' + num : num;
    };

    const nowDate = new Date();
    const d = addZeroFilter(nowDate.getDate().toString());
    const mn = addZeroFilter((nowDate.getMonth() + 1).toString());
    const y = nowDate.getFullYear().toString();
    const h = addZeroFilter(nowDate.getHours().toString());
    const m = addZeroFilter(nowDate.getMinutes().toString());
    const s = addZeroFilter(nowDate.getSeconds().toString());
    const ms = addZeroFilter(nowDate.getMilliseconds().toString());
    return `${d}.${mn}.${y} ${h}:${m}:${s}:${ms}`;
  }

  private getExecutorInfo(): { executor: string; link: string } {
    const e = new Error();
    if (!e.stack) return { executor: '', link: '' };
    const line = e.stack.split('\n')[4 + this.executorOffset];
    if (!line) return { executor: '', link: '' };

    const splits = line.trim().split(' ');

    let executor = splits[1] || '';
    let link = splits[2];

    if (!link) {
      link = executor ? `(${executor})` : '';
      const matches = executor.match(/[^/]+\.(ts|js)/);
      executor = matches ? matches[0] : '???';
    }

    return { executor, link };
  }
}
