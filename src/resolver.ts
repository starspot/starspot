interface Cache {
  [key: string]: TypeCache;
}

interface TypeCache {
  [key: string]: any;
}

export type Key = string | symbol;

export interface Factory {
  new (): any;
}

class Resolver {
  private factoryCache: Cache = { };
  private instanceCache: Cache = { };

  constructor(private rootPath?: string) {

  }

  static metaFor(instance: any): Resolver.Meta {
    return instance[Resolver.META];
  }

  registerFactory(type: string, name: Key, factory: Factory): void {
    cacheFor(this.factoryCache, type)[name] = factory;
  }

  findController(controllerName: string) {
    return this.findInstance("controller", controllerName);
  }

  findInstance(type: string, name: Key) {
    let cache = cacheFor(this.instanceCache, type);

    if (cache[name]) { return cache[name]; }

    let Factory = this.findFactory(type, name);
    let instance = new Factory();

    instance[Resolver.META] = { name, resolver: this };

    cache[name] = instance;

    return instance;
  }

  findFactory(type: string, name: Key) {
    let cache = cacheFor(this.factoryCache, type);

    if (cache[name]) { return cache[name]; }

    if (!this.rootPath) {
      name = name.toString();
      throw new Error(`The resolver's rootPath wasn't set, so it can't automatically look up the ${name} ${type}. Either register the ${name} ${type} ahead of time, or set a rootPath.`);
    }

    let factoryPath = `${this.rootPath}/resources/${name}/${type}`;

    return cache[name] = require(factoryPath).default;
  }
}

namespace Resolver {
  export const MAIN = Symbol("resolver main");
  export const META = Symbol("meta");

  export interface Meta {
    name: string;
    resolver: Resolver;
  }

  export interface Result {
    [meta: string]: Meta
  }
}

function cacheFor(cache: Cache, type: string): TypeCache {
  let typeCache = cache[type];

  if (!typeCache) {
    typeCache = cache[type] = {};
  }

  return typeCache;
}

export default Resolver;