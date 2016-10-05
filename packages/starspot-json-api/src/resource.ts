interface ResourceFactory {
  new (model?: any): Resource;
}

class Resource {
  model: any;
  // This is a hack due to a limitation in TypeScript:
  // https://github.com/Microsoft/TypeScript/issues/3841
  "constructor": typeof Resource;

  constructor(model?: any) {
    this.model = model;
  }

  static _findAll(): Resource[] {
    let ResourceClass = this.constructor as ResourceFactory;
    return this.findAll().map(m => new ResourceClass(m));
  }

  static findAll?(): any[];
}

export default Resource;