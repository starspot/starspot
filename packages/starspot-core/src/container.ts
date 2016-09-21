import Environment from "./environment";
import UI from "./ui";
import Resolver from "./resolver";

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

export type Entity = [string, Key];

export interface InjectionOptions {
  /** The resolver type and name to inject into */
  with: Entity;
  /** Set the injected value to this property name */
  as: string;

  /** Optional name for this injection used for debugging */
  annotation?: string;
}

const ALL = Symbol("all");

export interface ConstructorOptions {
  rootPath?: string;
  resolver?: Resolver;
  env?: Environment;
  ui?: UI;
}

class Container {
  public resolver: Resolver;

  private ui: UI;
  private env: Environment;

  private factoryCache: Cache = { };
  private instanceCache: Cache = { };
  private moduleCache: Cache = { };

  private factoryRegistrations: Cache = { };
  private injectionsMap: Cache = { };
  private fileMap: FileMap = { };

  constructor(options: ConstructorOptions = {}) {
    let rootPath = options.rootPath;
    this.resolver = options.resolver || new Resolver({ rootPath });
    this.ui = options.ui || new UI();
    this.env = options.env || new Environment();
  }

  static metaFor(instance: any): Container.Meta {
    return instance[Container.META];
  }

  registerFactory(type: string, name: Key, factory: Factory): void {
    cacheFor(this.factoryRegistrations, type)[name] = factory;
  }

  registerInstance(type: string, name: Key, instance: any): void {
    cacheFor(this.instanceCache, type)[name] = instance;
    this.brandInstance(instance, name);
  }

  inject(target: Entity, options: InjectionOptions): void;
  inject(type: string, options: InjectionOptions): void;
  inject(target: any, options: InjectionOptions) {
    let injections: InjectionOptions[];

    if (typeof target === "string") {
      injections = this.injectionsFor(target);
    } else {
      let [type, name] = target;
      injections = this.injectionsFor(type, name);
    }

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

    cache = cacheFor(this.moduleCache, type);
    cache[name] = null;

    delete require.cache[require.resolve(path)];
  }

  findModule(type: string, name: Key) {
    let cache = cacheFor(this.moduleCache, type);
    if (cache[name]) { return cache[name]; }

    let resolution = this.resolver.resolve<any>([type, name]);
    if (!resolution) { return null; }

    let [mod, modulePath] = resolution;

    this.fileMap[modulePath] = [type, name];

    return cache[name] = mod;
  }

  findInstance(type: string, name: Key) {
    let cache = cacheFor(this.instanceCache, type);

    if (cache[name]) { return cache[name]; }

    let Factory = this.findFactory(type, name);
    if (!Factory) { return null; }

    let instance = new Factory();
    this.brandInstance(instance, name);

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

    let Factory = this.findModule(type, name);
    if (!Factory) { return null; }

    return cache[name] = this.buildFactoryWithInjections(type, name, Factory);
  }

  brandInstance(instance: any, name: Key) {
    instance[Container.META] = { name, container: this };
  }

  injectionsFor(type: string, name: Key = ALL): InjectionOptions[] {
    let typeInjections = cacheFor(this.injectionsMap, type);
    let injections = typeInjections[name];

    if (!injections) {
      injections = typeInjections[name] = [];
    }

    return injections;
  }

  buildFactoryWithInjections(type: string, name: Key, factory: Factory): any {
    let injections = this.injectionsFor(type, name);
    let typeInjections = this.injectionsFor(type);

    if (!injections && !typeInjections) { return factory; }

    injections = injections || [];
    typeInjections = typeInjections || [];

    if (!injections.length && !typeInjections.length) { return factory; }

    injections = injections.concat(typeInjections);

    injections.filter(injection => {
      let [withType, withName] = injection.with;
      if (withType === type && withName === name) {
        let annotation = injection.annotation || "an injection";
        throw new Error(`Circular injection detected: injection "${annotation}" attempted to inject ${name} ${type} into itself.`);
      }
    });

    let resolver = this;

    return function() {
      let instance = new factory(...arguments);

      injections.forEach((injection) => {
        let [injectionType, injectionName] = injection.with;
        instance[injection.as] = resolver.findInstance(injectionType, injectionName);
      });

      return instance;
    };
  }
}

namespace Container {
  export const MAIN = Symbol("resolver main");
  export const META = Symbol("meta");

  export interface Meta {
    name: string;
    container: Container;
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

export default Container;