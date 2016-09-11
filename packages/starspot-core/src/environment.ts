export default class Environment {
  public mode: string;
  public isDevelopment: boolean;
  public isProduction: boolean;

  constructor(mode?: string);
  constructor(options: { mode: string });
  constructor(options?: any) {
    let mode: string;
    if (typeof options === "string") {
      mode = options;
    } else if (typeof options === "object") {
      mode = options.mode;
    }

    this.mode = mode || process.env.NODE_ENV || "development";
    this.isDevelopment = this.mode === "development";
    this.isProduction = this.mode === "production";
  }
}