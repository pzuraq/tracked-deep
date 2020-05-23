import { createTrackedDeep } from './-private';

export default function trackedDeep(obj) {
  return createTrackedDeep(obj);
}
