import MetadataMap from "./metadata-map";
import ArrayMetadataMap from "./array-metadata-map";
import DescriptorMap, { Descriptor } from "./descriptor-map";

export type Key = string | symbol;

const Metadata = new WeakMap<any, Map<Key, MetadataMap<any, any>>>();

export function metadataFor<K, V>(target: any, key: Key, create = true): MetadataMap<K, V> {
  return getOrCreateMetadata(target, key, MetadataMap, create);
}

export function descriptorsFor<K, V extends Descriptor>(target: any, key: Key, create = true): DescriptorMap<K, V> {
  return getOrCreateMetadata(target, key, DescriptorMap, create) as DescriptorMap<K, V>;
}

export function arrayMetadataFor<K, V>(target: any, key: Key, create = true): ArrayMetadataMap<K, V> {
  return getOrCreateMetadata(target, key, ArrayMetadataMap, create) as ArrayMetadataMap<K, V>;
}

export interface MetadataMapConstructor<K, V> {
  new(parent?: MetadataMap<K, V>): MetadataMap<K, V>
}

export function getOrCreateMetadata<K, V>(target: any, key: Key, MetadataMapClass: MetadataMapConstructor<K, V>, create = true): MetadataMap<K, V> {
  let targetMetadata = Metadata.get(target);

  if (!targetMetadata) {
    if (!create) { return null; }
    targetMetadata = new Map<Key, MetadataMap<K, V>>()
    Metadata.set(target, targetMetadata);
  }

  let metadata = targetMetadata.get(key);
  if (!metadata) {
    if (!create) { return null; }

    let parentMetadata = findParentMetadata<K, V>(target, key);
    metadata = new MetadataMapClass(parentMetadata);
    targetMetadata.set(key, metadata);
  }

  return metadata;
}

export function setMetadataFor<K, V>(target: any, key: Key, metadata: MetadataMap<K, V>): void {
  let targetMetadata = Metadata.get(target);

  if (!targetMetadata) {
    targetMetadata = new Map<Key, MetadataMap<K, V>>()
    Metadata.set(target, targetMetadata);
  }

  targetMetadata.set(key, metadata);
}

function findParentMetadata<K, V>(target: any, key: Key): MetadataMap<K, V> {
  let proto = Object.getPrototypeOf(target);

  if (proto && proto !== Function && proto !== Object) {
    return metadataFor<K, V>(proto, key);
  }

  return null;
}

