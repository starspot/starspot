import Environment from "./environment";
import UI from "./ui";
import Resolver, { Resolution } from "./resolver";

export interface Cache {
  [key: string]: TypeCache;
}

export interface TypeCache {
  [key: string]: any;
}

export interface FileMap {
  [key: string]: [string, Key];
}

export type Key = string | symbol;

export interface Factory {
  new (...args: any[]): any;
}

export type Entity = [string, Key];

export type InjectionTargetType = "factories" | "instances";

export interface InjectionOptions {
  /** The resolver type and name to inject into */
  with: Entity;
  /** Set the injected value to this property name */
  as: string;
  /** What type of objects this injection should be applied to. Can be either "factories" or "instances". */
  on?: InjectionTargetType;

  /** Optional name for this injection used for debugging */
  annotation?: string;
}

const ALL = Symbol("all");

export interface Resolvable {
  resolve<T>([type, name]: [string, Key]): Resolution<T>;
  invalidateCache(path: string): void;
}

export interface ConstructorOptions {
  rootPath?: string;
  resolver?: Resolvable;
  env?: Environment;
  ui?: UI;
}

class Container {
  public resolver: Resolvable;

  ui: UI;
  env: Environment;

  factoryCache: Cache = { };
  instanceCache: Cache = { };
  moduleCache: Cache = { };

  factoryRegistrations: Cache = { };
  injectionsMap: Cache = { };
  factoryInjectionsMap: Cache = { };
  fileMap: FileMap = { };

  constructor(options: ConstructorOptions = {}) {
    let rootPath = options.rootPath;
    this.resolver = options.resolver || new Resolver({ rootPath });
    this.ui = options.ui || new UI();
    this.env = options.env || new Environment();
  }

  static metaFor(instance: any): Container.Meta {
    return instance[Container.META];
  }

  static containerFor(instance: any): Container {
    let meta = Container.metaFor(instance);
    return (meta && meta.container) || null;
  }

  static nameFor(instance: any): string {
    let meta = Container.metaFor(instance);
    return (meta && meta.name) || null;
  }

  registerFactory(type: string, name: Key, factory: Factory): void {
    cacheFor(this.factoryRegistrations, type)[name] = factory;
  }

  registerInstance(type: string, name: Key, instance: any): void {
    cacheFor(this.instanceCache, type)[name] = instance;
    this.brand(instance, name);
  }

  inject(target: Entity, options: InjectionOptions): void;
  inject(type: string, options: InjectionOptions): void;
  inject(target: any, options: InjectionOptions) {
    let injections: InjectionOptions[];

    let isFactoryInjection = options.on === "factories";

    if (typeof target === "string") {
      injections = this.injectionsFor(target, ALL, isFactoryInjection);
    } else {
      let [type, name] = target;
      injections = this.injectionsFor(type, name, isFactoryInjection);
    }

    injections.push(options);
  }

  findController(controllerName: string) {
    return this.findInstance("controller", controllerName);
  }

  fileDidChange(fullPath: string) {
    // Strip off the file extension; this is done so that e.g. a .ts file or a
    // .js file changing will invalidate the same module, since we don't know in
    // what order the require hooks will load things.
    let path = stripFileExtension(fullPath);
    let fileInfo = this.fileMap[path];
    if (!fileInfo) { return; }

    let [type, name] = fileInfo;

    let cache = cacheFor(this.factoryCache, type);
    cache[name] = null;

    cache = cacheFor(this.instanceCache, type);
    cache[name] = null;

    cache = cacheFor(this.moduleCache, type);
    cache[name] = null;

    this.resolver.invalidateCache(fullPath);
  }

  findModule(type: string, name: Key) {
    let cache = cacheFor(this.moduleCache, type);
    if (cache[name]) { return cache[name]; }

    let resolution = this.resolver.resolve<any>([type, name]);
    if (!resolution) { return null; }

    let [mod, modulePath] = resolution;

    modulePath = stripFileExtension(modulePath);
    this.fileMap[modulePath] = [type, name];

    return cache[name] = mod;
  }

  findInstance(type: string, name: Key) {
    let cache = cacheFor(this.instanceCache, type);

    if (cache[name]) { return cache[name]; }

    let Factory = this.findFactory(type, name);
    if (!Factory) { return null; }

    let instance = new Factory();
    this.brand(instance, name);

    cache[name] = instance;
    return instance;
  }

  findFactory(type: string, name: Key) {
    let cache = cacheFor(this.factoryCache, type);
    if (cache[name]) { return cache[name]; }

    let registrations = cacheFor(this.factoryRegistrations, type);
    if (registrations[name]) {
      return cache[name] = this.buildFactory(type, name, registrations[name]);
    }

    let Factory = this.findModule(type, name);
    if (!Factory) { return null; }

    return cache[name] = this.buildFactory(type, name, Factory);
  }

  brand(obj: any, name: Key) {
    obj[Container.META] = { name, container: this };
  }

  injectionsFor(type: string, name: Key, isFactoryInjection: boolean): InjectionOptions[] {
    let injectionsMap = isFactoryInjection ? this.factoryInjectionsMap : this.injectionsMap;
    let typeInjections = cacheFor(injectionsMap, type);
    let injections = typeInjections[name];

    if (!injections) {
      injections = typeInjections[name] = [];
    }

    return injections;
  }

  findInjectionsFor(type: string, name: Key, factoryInjections: boolean): InjectionOptions[] {
    let injections = this.injectionsFor(type, name, factoryInjections) || [];
    let typeInjections = this.injectionsFor(type, ALL, factoryInjections) || [];

    if (!injections.length && !typeInjections.length) {
      return null;
    }

    let allInjections = injections.concat(typeInjections);

    allInjections.forEach(injection => {
      let [withType, withName] = injection.with;
      if (withType === type && withName === name) {
        let annotation = injection.annotation || "an injection";
        throw new Error(`Circular injection detected: injection "${annotation}" attempted to inject ${name} ${type} into itself.`);
      }
    });

    return allInjections;
  }

  buildFactory(type: string, name: Key, factory: Factory): any {
    let instanceInjections = this.findInjectionsFor(type, name, false);
    let injectedFactory: () => any;

    if (!instanceInjections) {
      injectedFactory = buildFactory(this, name, factory);
    } else {
      injectedFactory = buildFactoryWithInjections(this, name, factory, instanceInjections);
    }

    Object.setPrototypeOf(injectedFactory, factory);

    let factoryInjections = this.findInjectionsFor(type, name, true);
    if (factoryInjections) {
      applyInjections(injectedFactory, factoryInjections, this);
    }

    this.brand(injectedFactory, name);
    injectedFactory.constructor = factory;

    return injectedFactory;
  }
}

function buildFactory(container: Container, name: Key, factory: Factory) {
  return function() {
    let instance = new factory(...arguments);
    container.brand(instance, name);

    return instance;
  };
}

function applyInjections(target: any, injections: InjectionOptions[], container: Container) {
  injections.forEach((injection) => {
    let [injectionType, injectionName] = injection.with;
    target[injection.as] = container.findInstance(injectionType, injectionName);
  });
}

function buildFactoryWithInjections(container: Container, name: Key, factory: Factory, injections: InjectionOptions[]) {
  return function() {
    let instance = new factory(...arguments);
    container.brand(instance, name);
    applyInjections(instance, injections, container);

    return instance;
  };
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

function stripFileExtension(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

function cacheFor(cache: Cache, type: string): TypeCache {
  let typeCache = cache[type];

  if (!typeCache) {
    typeCache = cache[type] = {};
  }

  return typeCache;
}

export default Container;