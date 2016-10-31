import MetadataMap from "./metadata-map";

export default class DescriptorMap<K, V extends Descriptor> extends MetadataMap<K, V> {
  get(key: K): V {
    let val = super.get(key);

    if (!val) { return null; }

    if (this.hasOwn(key)) {
      if (!isDescriptor(val)) {
        throw new Error(`Tried to get metadata descriptor for key ${String(key)} but the key contained a non-cloneable value.`);
      }
    } else {
      if (isDescriptor(val)) {
        val = val.clone();
        this.set(key, val);
      } else {
        throw new Error(`Tried to get metadata descriptor for key ${String(key)} but the parent metadata contained a non-cloneable value.`);
      }
    }

    return val;
  }
}

function isDescriptor(target: any): target is Descriptor {
  return target && typeof target.clone === 'function';
}

export interface Descriptor {
  clone(): this;
}