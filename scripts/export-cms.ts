import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  backupChecksum,
  cmsBackupPayloadSchema,
} from "../src/domain/ops/backup";
import { createCmsRuntime } from "./lib/cms-runtime";

function outputDirectory() {
  const requested = process.argv
    .find((argument) => argument.startsWith("--output="))
    ?.slice("--output=".length);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.resolve(process.cwd(), "backups");
  const target = path.resolve(process.cwd(), requested ?? `backups/cms-${stamp}`);
  const relative = path.relative(backupRoot, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Backup output must be a new directory inside ./backups.");
  }
  return target;
}

async function main() {
  const output = outputDirectory();
  const mediaDirectory = path.join(output, "media");
  await mkdir(mediaDirectory, { recursive: true });
  const { db, supabase } = createCmsRuntime();

  try {
    const [adminUsers, mediaAssets, skills, experiences, projects] =
      await Promise.all([
        db.adminUser.findMany({ orderBy: { userId: "asc" } }),
        db.mediaAsset.findMany({ orderBy: { id: "asc" } }),
        db.skill.findMany({ orderBy: { id: "asc" } }),
        db.experience.findMany({
          include: { highlights: { orderBy: { position: "asc" } } },
          orderBy: { id: "asc" },
        }),
        db.project.findMany({
          include: {
            highlights: { orderBy: { position: "asc" } },
            contributions: { orderBy: { position: "asc" } },
            impacts: { orderBy: { position: "asc" } },
            impactStats: { orderBy: { position: "asc" } },
            skills: { orderBy: { position: "asc" } },
            media: { orderBy: { position: "asc" } },
          },
          orderBy: { id: "asc" },
        }),
      ]);

    const referencedMediaIds = new Set([
      ...experiences.flatMap(({ coverMediaId }) =>
        coverMediaId ? [coverMediaId] : [],
      ),
      ...projects.flatMap(({ media }) =>
        media.map(({ mediaAssetId }) => mediaAssetId),
      ),
    ]);
    const mediaFiles = [];

    for (const asset of mediaAssets) {
      if (!referencedMediaIds.has(asset.id) || asset.status !== "READY") continue;
      const { data, error } = await supabase.storage
        .from(asset.bucket)
        .download(asset.objectPath);
      if (error || !data) {
        throw new Error(`Cannot export ${asset.objectPath}: ${error?.message}`);
      }
      const buffer = Buffer.from(await data.arrayBuffer());
      const extension =
        asset.mimeType === "image/webp"
          ? "webp"
          : asset.mimeType === "image/png"
            ? "png"
            : asset.mimeType === "image/jpeg"
              ? "jpg"
              : "bin";
      const relativeFile = `media/${asset.id}.${extension}`;
      await writeFile(path.join(output, relativeFile), buffer);
      mediaFiles.push({
        mediaAssetId: asset.id,
        bucket: asset.bucket,
        objectPath: asset.objectPath,
        file: relativeFile,
        sha256: createHash("sha256").update(buffer).digest("hex"),
        sizeBytes: buffer.byteLength,
      });
    }

    const serialized: unknown = JSON.parse(
      JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        adminUsers,
        mediaAssets,
        skills,
        experiences,
        projects,
        mediaFiles,
      }),
    );
    const payload = cmsBackupPayloadSchema.parse(serialized);
    const manifest = { ...payload, checksum: backupChecksum(payload) };
    await writeFile(
      path.join(output, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    process.stdout.write(
      `${JSON.stringify(
        {
          output,
          checksum: manifest.checksum,
          counts: {
            projects: projects.length,
            experiences: experiences.length,
            skills: skills.length,
            mediaMetadata: mediaAssets.length,
            mediaFiles: mediaFiles.length,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `CMS export failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
