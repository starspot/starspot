export default class SSLNotFoundError extends Error {
  public missingFile: string;
  public name: string;

  constructor(options: { missingFile: string }) {
    let { missingFile } = options;

    super("Required SSL file not found: " + missingFile);

    this.missingFile = missingFile;
    this.name = "no-ssl";
  }
}