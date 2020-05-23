class Tag {
  @tracked __tag;
}

export function createTag() {
  return new Tag();
}

export function consumeTag(tag) {
  tag.__tag;
}

export function dirtyTag(tag) {
  tag.__tag = undefined;
}
