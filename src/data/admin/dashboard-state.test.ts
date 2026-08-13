import { describe, expect, it } from "vitest";

import { formatStorageBytes, isDashboardEmpty } from "./dashboard-state";

function dashboardData() {
  return {
    projects: { active: 0, archived: 0 },
    experiences: { active: 0, archived: 0 },
    skills: { active: 0, archived: 0 },
    media: { ready: 0, pending: 0, sizeBytes: 0 },
    recentActivity: [],
  };
}

describe("dashboard state", () => {
  it("recognizes a completely empty content database", () => {
    expect(isDashboardEmpty(dashboardData())).toBe(true);
  });

  it("includes archived records when detecting content", () => {
    const data = dashboardData();
    data.projects.archived = 1;
    expect(isDashboardEmpty(data)).toBe(false);
  });

  it("formats tracked storage without exaggerating precision", () => {
    expect(formatStorageBytes(0)).toBe("0 B");
    expect(formatStorageBytes(1_536)).toBe("1.5 KB");
    expect(formatStorageBytes(2_621_440)).toBe("2.5 MB");
    expect(formatStorageBytes(1_610_612_736)).toBe("1.50 GB");
  });
});
