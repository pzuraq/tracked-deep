import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

export default function deepTrackedSet(set, shallow) {
  return new DeepTrackedSet(set, shallow);
}

export function isTrackedSet(set) {
  return set instanceof DeepTrackedSet;
}

class DeepTrackedSet {
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

    this._s = shallow;
    this._v = values;
  }

  _s;
  _v;
  _t = new Map();
  _c = createTag();

  _getOrCreateTag(value) {
    let tag = this._t.get(value);

    if (tag === undefined) {
      tag = createTag();
      this._t.set(value, tag)
    }

    return tag;
  }

  // **** KEY GETTERS ****
  has(value) {
    consumeTag(this._getOrCreateTag(value));

    return this._v.has(value);
  }

  // **** ALL GETTERS ****
  [Symbol.iterator]() {
    consumeCollection(this, this._c);
    return this._v[Symbol.iterator]();
  }

  entries() {
    consumeCollection(this, this._c);
    return this._v.entries();
  }

  keys() {
    consumeCollection(this, this._c);
    return this._v.keys();
  }

  values() {
    consumeCollection(this, this._c);
    return this._v.values();
  }

  forEach(fn) {
    consumeCollection(this, this._c);
    this._v.forEach(fn);
  }

  get size() {
    consumeCollection(this, this._c);
    return this._v.size;
  }

  // **** KEY SETTERS ****
  add(value) {
    dirtyCollection(this, this._c);

    let tag = this._t.get(value);

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    this._v.add(this._s === true ? value : createTrackedDeep(value, false));
  }

  delete(value) {
    dirtyCollection(this, this._c);

    let tag = this._t.get(value);

    if (tag !== undefined) {
      dirtyTag(tag);
      this._t.delete(key);
    }

    this._v.delete(value);
  }

  // **** ALL SETTERS ****
  clear() {
    dirtyCollection(this, this._c);

    this._t.forEach(dirtyTag);

    this._t.clear();
    this._v.clear();
  }
}

Object.setPrototypeOf(DeepTrackedSet.prototype, Set.prototype);
