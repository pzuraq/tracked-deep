import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

export default class DeepTrackedSet {
  constructor(set, shallow = false) {
    let values;

    if (shallow === true) {
      values = new Set(set);
    } else {
      values = new Set();

      for (let v of set) {
        values.add(createTrackedDeep(v, false));
      }
    }

    this.#shallow = shallow;
    this.#values = values;
  }

  #shallow;
  #values;
  #tags = new Map();
  #collection = createTag();

  _getOrCreateTag(value) {
    let tag = this.#tags.get(value);

    if (tag === undefined) {
      tag = createTag();
      this.#tags.set(value, tag)
    }

    return tag;
  }

  // **** KEY GETTERS ****
  has(value) {
    consumeTag(this._getOrCreateTag(value));

    return this.#values.has(value);
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
  add(value) {
    dirtyCollection(this, this.#collection);

    let tag = this.#tags.get(value);

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    this.#values.add(this.#shallow === true ? value : createTrackedDeep(value, false));
  }

  delete(value) {
    dirtyCollection(this, this.#collection);

    let tag = this.#tags.get(value);

    if (tag !== undefined) {
      dirtyTag(tag);
      this.#tags.delete(key);
    }

    this.#values.delete(value);
  }

  // **** ALL SETTERS ****
  clear() {
    dirtyCollection(this, this.#collection);

    this.#tags.forEach(dirtyTag);

    this.#tags.clear();
    this.#values.clear();
  }
}

Object.setPrototypeOf(DeepTrackedSet.prototype, Set.prototype);
