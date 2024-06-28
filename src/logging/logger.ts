import { LiteAutoBind } from '@/auto-bind';
import { LiteEvent } from '@/reactive';

export type LiteLogType = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export const convertLoggerArgumentToText = (arg: unknown) => {
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

export type LiteLogWritter = {
  debug(...args: any[]): void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export type LiteLogEvent = {
  type: LiteLogType;
  text: string;
  executor: string;
};

export type LiteLoggerParams = {
  logEvent: LiteEvent<LiteLogEvent>;
  executorOffset: number;
  loggerName: string;
  logPrefix: string;
  logSuffix: string;
};

export class LiteLogger extends LiteAutoBind implements LiteLogWritter {
  public readonly logEvent = new LiteEvent<LiteLogEvent>();
  private readonly executorOffset: number = 0;
  private readonly loggerName: string = '';
  private readonly logPrefix: string = '';
  private readonly logSuffix: string = '';

  constructor(params: Partial<LiteLoggerParams> = {}) {
    super();
    this.logEvent = params.logEvent || this.logEvent;
    this.executorOffset = params.executorOffset || this.executorOffset;
    this.loggerName = params.loggerName || this.loggerName;
    this.logPrefix = params.logPrefix || this.logPrefix;
    this.logSuffix = params.logSuffix || this.logSuffix;
  }

  debug(...args: any[]): void {
    this.emit('DEBUG', ...args);
  }

  error(...args: any[]): void {
    this.emit('ERROR', ...args);
  }

  info(...args: any[]): void {
    this.emit('INFO', ...args);
  }

  warn(...args: any[]): void {
    this.emit('WARNING', ...args);
  }

  private emit(type: LiteLogType, ...args: any[]): void {
    const { executor, link } = this.getExecutorInfo();
    const codeLink = link ? `\r\n${link}` : '';
    const loggerName = this.loggerName ? ` <${this.loggerName}>` : '';
    const logPrefix = this.logPrefix ? `${this.logPrefix} ` : '';
    const logSuffix = this.logSuffix ? ` ${this.logSuffix}` : '';
    const text =
      `${this.getCurrentTime()} ${type}${loggerName} (${executor}) ` +
      `${logPrefix}${this.argsToString(args)}${logSuffix}` +
      codeLink +
      '\r\n';
    this.logEvent.emit({ type, text, executor });
  }

  private getCurrentTime() {
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

  private argsToString(args: any[]): string {
    return args.map(convertLoggerArgumentToText).join(' ');
  }
}
