import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

export default function deepTrackedMap(map, shallow) {
  return new DeepTrackedMap(map, shallow);
}

export function isTrackedMap(map) {
  return map instanceof DeepTrackedMap;
}

class DeepTrackedMap {
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

    this._s = shallow;
    this._v = values;
  }

  _s;
  _v;
  _t = new Map();
  _c = createTag();

  _getOrCreateTag(key) {
    let tag = this._t.get(key);

    if (tag === undefined) {
      tag = createTag();
      this._t.set(key, tag)
    }

    return tag;
  }


  // **** KEY GETTERS ****
  get(key) {
    consumeTag(this._getOrCreateTag(key));

    return this._v.get(key);
  }

  has(key) {
    consumeTag(this._getOrCreateTag(key));

    return this._v.has(key);
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
  set(key, value) {
    dirtyCollection(this, this._c);

    let tag = this._t.get(key);

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    this._v.set(key, this._s === true ? value : createTrackedDeep(value, false));
  }

  delete(key) {
    dirtyCollection(this, this._c);

    let tag = this._t.get(key);

    if (tag !== undefined) {
      dirtyTag(tag);
      this._t.delete(key);
    }

    this._v.delete(key);
  }

  // **** ALL SETTERS ****
  clear() {
    dirtyCollection(this, this._c);

    this._t.forEach(dirtyTag);

    this._t.clear();
    this._v.clear();
  }
}

Object.setPrototypeOf(DeepTrackedMap.prototype, Map.prototype);

