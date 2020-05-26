import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

const ARRAY_BRAND = Symbol();

const ARRAY_GETTER_METHODS = new Set([
  Symbol.iterator,
  'concat',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
]);

function convertToInt(prop) {
  if (typeof prop === 'symbol') return null;

  const num = Number(prop);

  if (isNaN(num)) return null;

  return num % 1 === 0 ? num : null;
}

// This class allows us to reuse the proxy handler methods, while
// storing state on the instances of the handler.
class ArrayProxyHandler {
  constructor(shallow) {
    this._s = shallow;
  }

  _s;
  _t = [];
  _b = new Map();
  _c = createTag();

  get(target, prop, receiver) {
    if (prop === ARRAY_BRAND) {
      return true;
    }

    let index = convertToInt(prop);

    if (index !== null) {
      let tag = this._t[index];

      if (tag === undefined) {
        tag = this._t[index] = createTag();
      }

      consumeTag(tag);
      consumeCollection(receiver, this._c);

      return target[index];
    } else if (prop === 'length') {
      consumeCollection(receiver, this._c);
    } else if (ARRAY_GETTER_METHODS.has(prop)) {
      let fn = this._b.get(prop);

      if (fn === undefined) {
        let tag = this._c

        fn = (...args) => {
          consumeCollection(receiver, tag);
          return target[prop](...args);
        };

        this._b.set(prop, fn);
      }

      return fn;
    }

    return target[prop];
  }

  set(target, prop, value, receiver) {
    target[prop] = this._s === true ? value : createTrackedDeep(value, false);

    let index = convertToInt(prop);

    if (index !== null) {
      let tag = this._t[index];

      if (tag !== undefined) {
        dirtyTag(tag);
      }

      dirtyCollection(receiver, this._c);
    } else if (prop === 'length') {
      dirtyCollection(receiver, this._c);
    }

    return true;
  }
}

export default function deepTrackedArray(arr, shallow = false) {
  return new Proxy(
    shallow === true ? arr.slice() : arr.map(v => createTrackedDeep(v, false)),
    new ArrayProxyHandler(shallow)
  );
}

export function isTrackedArray(arr) {
  return Boolean(arr[ARRAY_BRAND]);
}
