import { createTag, consumeTag, dirtyTag } from './util/tag-tracking';
import { consumeCollection, dirtyCollection } from './util/collections'
import { createTrackedDeep } from '.';

class ObjectProxyHandler {
  constructor(shallow) {
    this.#shallow = shallow;
  }

  #shallow;
  #tags = Object.create(null);
  #collection = createTag();

  getOrCreateTag(key) {
    let tag = this.#tags[key];

    if (tag === undefined) {
      tag = this.#tags[key] = createTag();
    }

    return tag;
  }

  get(target, prop) {
    consumeTag(this.getOrCreateTag(prop));

    return target[prop];
  }

  has(target, prop) {
    consumeTag(this.getOrCreateTag(prop));

    return prop in target;
  }

  ownKeys(target) {
    consumeCollection(receiver, this.#collection);

    return Reflect.ownKeys(target);
  }

  set(target, prop, value, receiver) {
    target[prop] = this.#shallow === true ? value : createTrackedDeep(value, false);

    let tag = this.#tags[prop];

    if (tag !== undefined) {
      dirtyTag(tag);
    }

    dirtyCollection(receiver, this.#collection);

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
