import deepTrackedObject, { isTrackedObject } from './object';
import deepTrackedArray, { isTrackedArray } from './array';
import deepTrackedMap, { isTrackedMap } from './map';
import deepTrackedSet, { isTrackedSet } from './set';

export {
  deepTrackedObject,
  deepTrackedArray,
  deepTrackedMap,
  deepTrackedSet,

  isTrackedObject,
  isTrackedArray,
  isTrackedMap,
  isTrackedSet,
};

export function createTrackedDeep(
  obj,
  throwIfUntrackable = true,
  shallow = false
) {
  let prototype = Object.getPrototypeOf(obj);

  if (prototype === null || prototype === Object.prototype) {
    return deepTrackedObject(obj, shallow);
  }

  if (Array.isArray(obj)) {
    return deepTrackedArray(obj, shallow);
  }

  if (obj instanceof Map) {
    return deepTrackedMap(obj, shallow);
  }

  if (obj instanceof Set) {
    return deepTrackedSet(obj, shallow);
  }

  if (throwIfUntrackable === true) {
    throw new Error('Could not wrap a deep tracked object');
  }

  return obj;
}
