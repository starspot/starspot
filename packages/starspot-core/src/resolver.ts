import * as inflected from "inflected";
import { relative } from "path";

import Environment from "./environment";
import UI from "./ui";
import Container, { Entity } from "./container";
import StarspotError from "./errors/starspot-error";

export interface PathMapper {
  (entity: Entity): string;
}

const MAIN_MODULES: PathMapper = function([type, name]) {
  if (name === Container.MAIN) {
    return `app/${type}`;
  }
};

const CONFIG_MODULES: PathMapper = function([type, name]) {
  if (type === "config") {
    return `config/${name}`;
  }
};

const RESOURCE_MODULES: PathMapper = function([type, name]) {
  if (typeof name === "string") {
    return `app/resources/${name}/${type}`;
  }
};

const CROSSCUTTING_MODULES: PathMapper = function([type, name]) {
  if (typeof name === "string") {
    let pluralizedType = inflected.pluralize(type);
    return `app/${pluralizedType}/${name}`;
  }
};

export interface Dict<T> {
  [key: string]: T;
}

export type Resolution<T> = [T, string];

export interface ConstructorOptions {
  /** Whether to throw an error if a lookup results in more than one matching
   *  module for the same entity. */
  throwOnConflict?: boolean;
  rootPath?: string;
  env?: Environment;
  ui?: UI;
}

export default class Resolver {
  public mappers = [MAIN_MODULES, RESOURCE_MODULES, CROSSCUTTING_MODULES];
  public perTypeMappers: Dict<PathMapper[]> = {
    config: [CONFIG_MODULES]
  };
  public rootPath: string;

  private ui: UI;
  private env: Environment;

  constructor(options: ConstructorOptions = {}) {
    this.env = options.env || new Environment();
    this.ui = options.ui || new UI();

    this.rootPath = options.rootPath;
  }

  resolve<T>(entity: Entity): Resolution<T> {
    if (!this.rootPath) {
      let [type, name] = entity;
      throw new Error(`The resolver's rootPath wasn't set, so it can't automatically look up the ${String(name)} ${type}. Either register the ${name} ${type} ahead of time, or set a rootPath.`);
    }

    let potentialPaths = this.resolvePaths(entity);

    if (this.env.isDevelopment) {
      this.detectConflictingFiles(entity, potentialPaths);
    }

    for (let i = 0; i < potentialPaths.length; i++) {
      let path = potentialPaths[i];
      let absolutePath = this.rootPath + "/" + path;
      let mod: any;

      try {
        this.ui.veryVerbose({
          name: "resolver-requiring-path",
          path: absolutePath
        });

        mod = require(absolutePath);
      } catch (e) {
        this.ui.veryVerbose({
          name: "resolver-requiring-error",
          path: absolutePath,
          error: e
        });
        continue;
      }

      // For error messages and autoreloading, we need to know the full,
      // resolved path with appropriate file extension, e.g., was it a .ts file
      // or a .js file?
      absolutePath = require.resolve(absolutePath);

      if (!mod.hasOwnProperty("default")) {
        throw new StarspotError({
          name: "no-default-export",
          path: relative(this.rootPath, absolutePath)
        });
      }

      return [mod.default, absolutePath];
    }
  }

  resolvePaths(entity: Entity) {
    let type = entity[0];

    let paths = (this.perTypeMappers[type] || this.mappers)
      .map(m => m(entity))
      .filter(p => p);

    this.ui.verbose({
      name: "resolver-resolve-paths",
      entityType: entity[0],
      entityName: entity[1],
      paths
    });

    return paths;
  }

  detectConflictingFiles([type, name]: Entity, paths: string[]) {
    function exists(path: string) {
      try {
        return require.resolve(this.rootPath + "/" + path);
      } catch (e) {
        return null;
      }
    }

    let foundFiles = paths
      .map(exists)
      .filter(p => p);

    if (foundFiles.length > 1) {
      throw new StarspotError({
        name: "conflicting-modules",
        entityName: name,
        entityType: type,
        paths: foundFiles
      });
    }
  }
}
