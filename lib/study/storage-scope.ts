// A document uses one owner for its entire lifetime. Account changes reload the document
// so queued writes and in-memory study state always belong to the original owner.
let owner: string | null = null;

export function initializeStudyOwner(userId: string | null) {
  owner = userId;
}

export function studyKey(key: string): string {
  return owner === null ? key : `enbrioatlas:account:${encodeURIComponent(owner)}:${key}`;
}
