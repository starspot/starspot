interface ResourceFactory {
  new (model?: any): Resource;
}

abstract class Resource {
  model: any;

  constructor(model?: any) {
    this.model = model;
  }

  _findAll(): Resource[] {
    let ResourceClass = this.constructor as ResourceFactory;
    return this.findAll().map(m => new ResourceClass(m));
  }

  abstract findAll(): any[];
}

export default Resource;