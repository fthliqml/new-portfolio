export function assertSkillCanBeDeleted(projectReferenceCount: number) {
  if (projectReferenceCount > 0) {
    throw new Error("Referenced skills cannot be permanently deleted.");
  }
}

export function nextSkillSortOrder(currentMaximum: number | null) {
  return (currentMaximum ?? -1) + 1;
}
