/**
 * One-Shot Timer
 */
export class OneShotTimer {
  private _timeout: NodeJS.Timeout

  public constructor(
    private readonly callback: (...args: any[]) => void,
    private readonly expirationMs: () => number,
    private readonly keepEventLoopActive = false,
  ) {}

  /**
   * Starts timer
   */
  public start() {
    this._timeout = setTimeout(this.callback, this.expirationMs())
    if (!this.keepEventLoopActive) {
      this._timeout.unref()
    }
  }

  /**
   * Stops timer
   */
  public stop() {
    clearTimeout(this._timeout)
  }

  /**
   * Restarts timer
   */
  public restart() {
    this.stop()
    this.start()
  }
}