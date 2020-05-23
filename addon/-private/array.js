import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

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
    this.#shallow = shallow;
  }

  #shallow;
  #tags = [];
  #bound = new Map();
  #collection = createTag();

  get(target, prop, receiver) {
    let index = convertToInt(prop);

    if (index !== null) {
      let tag = this.#tags[index];

      if (tag === undefined) {
        tag = this.#tags[index] = createTag();
      }

      consumeTag(tag);
      consumeCollection(receiver, this.#collection);

      return target[index];
    } else if (prop === 'length') {
      consumeCollection(receiver, this.#collection);
    } else if (ARRAY_GETTER_METHODS.has(prop)) {
      let fn = this.#bound.get(prop);

      if (fn === undefined) {
        let tag = this.#collection

        fn = (...args) => {
          consumeCollection(receiver, tag);
          return target[prop](...args);
        };

        this.#bound.set(prop, fn);
      }

      return fn;
    }

    return target[prop];
  }

  set(target, prop, value, receiver) {
    target[prop] = this.#shallow === true ? value : createTrackedDeep(value, false);

    let index = convertToInt(prop);

    if (index !== null) {
      let tag = this.#tags[index];

      if (tag !== undefined) {
        dirtyTag(tag);
      }

      dirtyCollection(receiver, this.#collection);
    } else if (prop === 'length') {
      dirtyCollection(receiver, this.#collection);
    }

    return true;
  }
}

export default function createArrayProxy(arr, shallow = false) {
  return new Proxy(
    shallow === true ? arr.slice() : arr.map(v => createTrackedDeep(v, false)),
    new ArrayProxyHandler(shallow)
  );
}
