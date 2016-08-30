interface Cache {
  [key: string]: TypeCache;
}

interface TypeCache {
  [key: string]: any;
}

interface FileMap {
  [key: string]: [string, Key];
}

export type Key = string | symbol;

export interface Factory {
  new (...args: any[]): any;
}

export type TypeNamePair = [string, Key];
export interface InjectionOptions {
  /** The resolver type and name to inject into */
  with: TypeNamePair;
  /** Set the injected value to this property name */
  as: string;
}

class Resolver {
  private factoryCache: Cache = { };
  private instanceCache: Cache = { };
  private factoryRegistrations: Cache = { };
  private injectionsMap: Cache = { };
  private fileMap: FileMap = { };

  constructor(private rootPath?: string) {

  }

  static metaFor(instance: any): Resolver.Meta {
    return instance[Resolver.META];
  }

  registerFactory(type: string, name: Key, factory: Factory): void {
    cacheFor(this.factoryRegistrations, type)[name] = factory;
  }

  inject(type: string, name: Key, options: InjectionOptions) {
    let injections = this.injectionsFor(type, name);
    injections.push(options);
  }

  findController(controllerName: string) {
    return this.findInstance("controller", controllerName);
  }

  fileDidChange(path: string) {
    path = path.split(".").slice(0, -1).join(".");
    let fileInfo = this.fileMap[path];
    if (!fileInfo) { return; }

    let [type, name] = fileInfo;

    let cache = cacheFor(this.factoryCache, type);
    cache[name] = null;

    cache = cacheFor(this.instanceCache, type);
    cache[name] = null;

    delete require.cache[require.resolve(path)];
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

    let registrations = cacheFor(this.factoryRegistrations, type);
    if (registrations[name]) {
      return this.buildFactoryWithInjections(type, name, registrations[name]);
    }

    if (!this.rootPath) {
      name = String(name);
      throw new Error(`The resolver's rootPath wasn't set, so it can't automatically look up the ${name} ${type}. Either register the ${name} ${type} ahead of time, or set a rootPath.`);
    }

    let factoryPath: string;

    if (name === Resolver.MAIN) {
      factoryPath = `${this.rootPath}/${type}`;
    } else {
      factoryPath = `${this.rootPath}/resources/${name}/${type}`;
    }

    this.fileMap[factoryPath] = [type, name];
    let factory = require(factoryPath).default;

    return cache[name] = this.buildFactoryWithInjections(type, name, factory);
  }

  injectionsFor(type: string, name: Key): InjectionOptions[] {
    let typeInjections = cacheFor(this.injectionsMap, type);
    let injections = typeInjections[name];

    if (!injections) {
      injections = typeInjections[name] = [];
    }

    return injections;
  }

  buildFactoryWithInjections(type: string, name: Key, factory: Factory): any {
    let injections = this.injectionsFor(type, name);

    if (!injections || injections.length === 0) { return factory; }

    let resolver = this;

    return function() {
      let instance = new factory(...arguments);

      for (let i = 0; i < injections.length; i++) {
        let injection = injections[0];
        let [injectionType, injectionName] = injection.with;

        instance[injection.as] = resolver.findInstance(injectionType, injectionName);
      }

      return instance;
    };
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
    [meta: string]: Meta;
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