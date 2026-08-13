export type ContentEntity = "project" | "experience" | "skill";
export type LifecycleOperation = "archive" | "restore" | "delete";

export function assertPermanentDeleteAllowed(input: {
  entity: ContentEntity;
  archived: boolean;
  projectReferences?: number;
}) {
  if (!input.archived) {
    throw new Error("Only archived content can be permanently deleted.");
  }
  if (input.entity === "skill" && (input.projectReferences ?? 0) > 0) {
    throw new Error("Referenced skills cannot be permanently deleted.");
  }
}

export function destructiveImpact(entity: ContentEntity, references = 0) {
  if (entity === "project") {
    return "Deletes the archived project and its case-study rows. Reusable media and skills remain intact.";
  }
  if (entity === "experience") {
    return `Deletes the archived experience. ${references} related ${references === 1 ? "project" : "projects"} will keep working with no related experience.`;
  }
  return references > 0
    ? `Blocked: this skill is still used by ${references} ${references === 1 ? "project" : "projects"}.`
    : "Deletes the archived skill. This action does not affect media.";
}
