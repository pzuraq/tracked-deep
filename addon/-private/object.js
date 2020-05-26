import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

const OBJECT_BRAND = Symbol();

class ObjectProxyHandler {
  constructor(shallow) {
    this._s = shallow;
  }

  _s;
  _t = Object.create(null);
  _c = createTag();

  getOrCreateTag(key) {
    let tag = this._t[key];

    if (tag === undefined) {
      tag = this._t[key] = createTag();
    }

    return tag;
  }

  get(target, prop) {
    if (prop === OBJECT_BRAND) {
      return true;
    }

    consumeTag(this.getOrCreateTag(prop));

    return target[prop];
  }

  has(target, prop) {
    consumeTag(this.getOrCreateTag(prop));

    return prop in target;
  }

  ownKeys(target) {
    consumeCollection(receiver, this._c);

    return Reflect.ownKeys(target);
  }

  set(target, prop, value, receiver) {
    target[prop] = this._s === true ? value : createTrackedDeep(value, false);

    let tag = this._t[prop];

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    dirtyCollection(receiver, this._c);

    return true;
  }
};

export default function deepTrackedObject(obj, shallow = false) {
  let newObj = {};

  if (shallow === true) {
    Object.assign(newObj, obj);
  } else {
    for (key in obj) {
      newObj[key] = createTrackedDeep(obj[key], false);
    }
  }

  return new Proxy(newObj, new ObjectProxyHandler(shallow));
}

export function isTrackedObject(obj) {
  return Boolean(obj[OBJECT_BRAND]);
}
