import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

export default class DeepTrackedMap {
  constructor(map, shallow = false) {
    let values;

    if (shallow === true) {
      values = new Map(map);
    } else {
      values = new Map();

      for (let [k, v] of map) {
        values.set(k, createTrackedDeep(v, false));
      }
    }

    this.#shallow = shallow;
    this.#values = values;
  }

  #shallow;
  #values;
  #tags = new Map();
  #collection = createTag();

  _getOrCreateTag(key) {
    let tag = this.#tags.get(key);

    if (tag === undefined) {
      tag = createTag();
      this.#tags.set(key, tag)
    }

    return tag;
  }


  // **** KEY GETTERS ****
  get(key) {
    consumeTag(this._getOrCreateTag(key));

    return this.#values.get(key);
  }

  has(key) {
    consumeTag(this._getOrCreateTag(key));

    return this.#values.has(key);
  }

  // **** ALL GETTERS ****
  [Symbol.iterator]() {
    consumeCollection(this, this.#collection);
    return this.#values[Symbol.iterator]();
  }

  entries() {
    consumeCollection(this, this.#collection);
    return this.#values.entries();
  }

  keys() {
    consumeCollection(this, this.#collection);
    return this.#values.keys();
  }

  values() {
    consumeCollection(this, this.#collection);
    return this.#values.values();
  }

  forEach(fn) {
    consumeCollection(this, this.#collection);
    this.#values.forEach(fn);
  }

  get size() {
    consumeCollection(this, this.#collection);
    return this.#values.size;
  }

  // **** KEY SETTERS ****
  set(key, value) {
    dirtyCollection(this, this.#collection);

    let tag = this.#tags.get(key);

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    this.#values.set(key, this.#shallow === true ? value : createTrackedDeep(value, false));
  }

  delete(key) {
    dirtyCollection(this, this.#collection);

    let tag = this.#tags.get(key);

    if (tag !== undefined) {
      dirtyTag(tag);
      this.#tags.delete(key);
    }

    this.#values.delete(key);
  }

  // **** ALL SETTERS ****
  clear() {
    dirtyCollection(this, this.#collection);

    this.#tags.forEach(dirtyTag);

    this.#tags.clear();
    this.#values.clear();
  }
}

Object.setPrototypeOf(DeepTrackedMap.prototype, Map.prototype);
