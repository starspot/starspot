export default class MetadataMap<K, V> extends Map<K, V> {
  parent?: MetadataMap<K, V>;

  constructor(parent?: MetadataMap<K, V>) {
    super();
    this.parent = parent;
  }

  has(key: K): boolean {
    let has = super.has(key);

    if (!has && this.parent) {
      return this.parent.has(key);
    }

    return has;
  }

  hasOwn(key: K) {
    return super.has(key);
  }

  get(key: K): V {
    if (!this.hasOwn(key) && this.parent) {
      return this.parent.get(key);
    }

    return super.get(key);
  }

  keys(): IterableIterator<K> {
    let ownKeys = this.ownKeys();

    if (!this.parent) { return ownKeys; }

    let parentKs = this.parent.keys();
    let keys = new Set(parentKs);

    for (let key of ownKeys) {
      keys.add(key);
    }

    return keys.values();
  }

  ownKeys(): IterableIterator<K> {
    return super.keys();
  }

  entries(): IterableIterator<[K, V]> {
    let ownEntries = this.ownEntries();
    if (!this.parent) { return ownEntries; }

    let map = mergeMaps<K, V>(this.parent.entries(), ownEntries);
    return map.entries();
  }

  ownEntries(): IterableIterator<[K, V]> {
    return super.entries();
  }
}

function mergeMaps<K, V>(...sources: Iterable<[K, V]>[]) {
  let target = new Map<K, V>();

  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];

    for (let [key, value] of source) {
      target.set(key, value);
    }
  }

  return target;
}