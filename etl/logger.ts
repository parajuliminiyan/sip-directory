import { appendLog, createLogFile } from './utils';

export class ETLLogger {
  private logPath: string | null = null;
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  async init(): Promise<void> {
    this.logPath = await createLogFile();
    await this.log('ETL Pipeline Started');
  }

  async log(message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO'): Promise<void> {
    const formattedMessage = `[${level}] ${message}`;

    // Always log to file
    if (this.logPath) {
      await appendLog(this.logPath, formattedMessage);
    }

    // Console output based on level and verbosity
    if (level === 'ERROR') {
      console.error(formattedMessage);
    } else if (level === 'WARN') {
      console.warn(formattedMessage);
    } else if (level === 'SUCCESS') {
      console.log(`✅ ${message}`);
    } else if (this.verbose) {
      console.log(formattedMessage);
    }
  }

  async info(message: string): Promise<void> {
    await this.log(message, 'INFO');
  }

  async warn(message: string): Promise<void> {
    await this.log(message, 'WARN');
  }

  async error(message: string): Promise<void> {
    await this.log(message, 'ERROR');
  }

  async success(message: string): Promise<void> {
    await this.log(message, 'SUCCESS');
  }

  getLogPath(): string | null {
    return this.logPath;
  }
}
