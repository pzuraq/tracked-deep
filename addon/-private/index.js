import deepTrackedObject from './object';
import deepTrackedArray from './array';
import DeepTrackedMap from './map';
import DeepTrackedSet from './set';

export function createTrackedDeep(obj, throwIfUntrackable = true, shallow = false) {
  let prototype = Object.getPrototypeOf(obj);

  if (prototype === null || prototype === Object.prototype) {
    return deepTrackedObject(obj, shallow);
  } if (Array.isArray(obj)) {
    return deepTrackedArray(obj, shallow);
  } else if (obj instanceof Map) {
    return new DeepTrackedMap(obj, shallow);
  } else if (obj instanceof Set) {
    return new DeepTrackedSet(obj, shallow);
  }

  if (throwIfUntrackable === true) {
    throw new Error('Could not wrap a deep tracked object')
  }

  return obj;
}
