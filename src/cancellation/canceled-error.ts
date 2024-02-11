export class LiteCanceledError implements Error {
  public name: string;
  public message: string;
  public stack?: string;

  constructor(message = '') {
    this.name = 'Canceled';
    this.message = 'Operation canceled';
    if (message) {
      this.message = `${this.message} ${message}`;
    }
  }
}
