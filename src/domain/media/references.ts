export interface MediaReferences {
  projectMedia: number;
  experienceCovers: number;
}

export function assertMediaCanBeDeleted(references: MediaReferences) {
  const total = references.projectMedia + references.experienceCovers;
  if (total > 0) {
    throw new Error(
      `This image is still used in ${total} content ${total === 1 ? "record" : "records"}. Remove those references first.`,
    );
  }
}
