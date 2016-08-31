export interface ConstructorOptions {
  name: string;
  [others: string]: any;
}

export default class StarspotError extends Error {
  [key: string]: any;

  constructor(options: ConstructorOptions) {
    super(options.name);

    for (let key in options) {
      this[key] = options[key];
    }
  }
}