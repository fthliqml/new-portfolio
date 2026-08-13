export interface DashboardCount {
  active: number;
  archived: number;
}

export interface DashboardActivity {
  id: string;
  type: "project" | "experience" | "skill" | "media";
  label: string;
  updatedAt: Date;
}

export interface DashboardData {
  projects: DashboardCount;
  experiences: DashboardCount;
  skills: DashboardCount;
  media: { ready: number; pending: number; sizeBytes: number };
  recentActivity: DashboardActivity[];
}

export function formatStorageBytes(bytes: number) {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

export function isDashboardEmpty(data: DashboardData) {
  return (
    data.projects.active +
      data.projects.archived +
      data.experiences.active +
      data.experiences.archived +
      data.skills.active +
      data.skills.archived +
      data.media.ready +
      data.media.pending ===
    0
  );
}
