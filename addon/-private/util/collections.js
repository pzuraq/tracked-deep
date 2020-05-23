import { consumeTag, dirtyTag } from './tag-tracking';

export let consumeCollection = (obj, tag) => consumeTag(tag);
export let dirtyCollection = (obj, tag) => dirtyKey(tag);

if (typeof Ember !== 'undefined') {
  consumeCollection = (obj) => Ember.get(obj, '[]');
  dirtyCollection = (obj) => Ember.notifyPropertyChange(obj, '[]');
}
