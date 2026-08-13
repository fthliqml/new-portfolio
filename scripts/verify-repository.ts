import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const violations: string[] = [];
const forbiddenTrackedFile = (file: string) =>
  file === "AGENTS.md" ||
  file === ".env" ||
  (/^\.env\./.test(file) && file !== ".env.example") ||
  file.startsWith("backups/") ||
  file.startsWith("src/generated/prisma/");

for (const file of trackedFiles.filter(forbiddenTrackedFile)) {
  violations.push(`${file}: local or generated artifact must not be tracked`);
}

const sourceFiles = trackedFiles.filter((file) => /\.(?:[cm]?[jt]sx?|json|ya?ml|md)$/.test(file));
const secretPatterns = [
  /sb_secret_[A-Za-z0-9_-]+/,
  /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@[^\s/]+/,
  /(?:SUPABASE_SECRET_KEY|CRON_SECRET)\s*[=:]\s*["'](?!replace-|your-|<)[^"']+["']/,
];
const serverOnlyEnvironment = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_SECRET_KEY",
  "ADMIN_USER_ID",
  "ADMIN_EMAIL",
  "CRON_SECRET",
];

for (const file of sourceFiles) {
  if (file === ".env.example") continue;
  const content = readFileSync(path.join(root, file), "utf8");
  const contentWithoutLocalFallback = content.replace(
    "postgresql://portfolio:portfolio@127.0.0.1:5432/portfolio",
    "",
  );

  if (secretPatterns.some((pattern) => pattern.test(contentWithoutLocalFallback))) {
    violations.push(`${file}: possible credential detected`);
  }

  if (/^[\s]*["']use client["']/m.test(content)) {
    for (const name of serverOnlyEnvironment) {
      if (content.includes(name)) {
        violations.push(`${file}: client module references server-only ${name}`);
      }
    }
  }

  if (
    file.startsWith("src/app/admin/(protected)/") &&
    file.endsWith("/actions.ts") &&
    !content.includes("requireAdminMutation")
  ) {
    violations.push(`${file}: protected server actions must call requireAdminMutation`);
  }
}

if (violations.length > 0) {
  console.error("Repository verification failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Repository verification passed (${trackedFiles.length} tracked files scanned).`);
