import MetadataMap from "./metadata-map";

export default class ArrayMetadataMap<K, V> extends MetadataMap<K, V[]> {
  getArray(key: K): V[] {
    let arr: V[] = this.get(key);

    if (!arr) {
      arr = [];
      this.set(key, arr);
      return arr;
    }

    if (this.hasOwn(key)) {
      if (!Array.isArray(arr)) {
        throw new Error(`Tried to get metadata array for key ${String(key)} but the key contained a non-array value.`);
      }
    } else {
      if (!Array.isArray(arr)) {
        throw new Error(`Tried to get metadata array for key ${String(key)} but the parent metadata contained a non-array value.`);
      }

      arr = arr.slice();
      this.set(key, arr);
    }

    return arr;
  }
}