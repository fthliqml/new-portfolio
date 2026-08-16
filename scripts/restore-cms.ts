import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  ContentStatus,
  MediaStatus,
  ProjectCategory,
  SkillCategory,
} from "../src/generated/prisma/enums";
import { parseBackupManifest } from "../src/domain/ops/backup";
import { createCmsRuntime } from "./lib/cms-runtime";

function inputDirectory() {
  const requested = process.argv
    .find((argument) => argument.startsWith("--input="))
    ?.slice("--input=".length);
  if (!requested) throw new Error("Pass --input=backups/<backup-directory>.");
  const backupRoot = path.resolve(process.cwd(), "backups");
  const target = path.resolve(process.cwd(), requested);
  const relative = path.relative(backupRoot, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Restore input must be a directory inside ./backups.");
  }
  return target;
}

function date(value: string) {
  return new Date(value);
}

function optionalDate(value: string | null) {
  return value ? date(value) : null;
}

async function main() {
  const input = inputDirectory();
  const manifest = parseBackupManifest(
    JSON.parse(await readFile(path.join(input, "manifest.json"), "utf8")) as unknown,
  );
  const { db, supabase } = createCmsRuntime();

  try {
    for (const file of manifest.mediaFiles) {
      const absoluteFile = path.resolve(input, file.file);
      const relative = path.relative(input, absoluteFile);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Unsafe media path in manifest: ${file.file}`);
      }
      const buffer = await readFile(absoluteFile);
      const checksum = createHash("sha256").update(buffer).digest("hex");
      if (checksum !== file.sha256 || buffer.byteLength !== file.sizeBytes) {
        throw new Error(`Media checksum mismatch: ${file.file}`);
      }
      const asset = manifest.mediaAssets.find(
        ({ id }) => id === file.mediaAssetId,
      );
      if (!asset) throw new Error(`Missing media metadata: ${file.mediaAssetId}`);
      const { error } = await supabase.storage
        .from(file.bucket)
        .upload(file.objectPath, buffer, {
          contentType: asset.mimeType,
          cacheControl: "31536000",
          upsert: true,
        });
      if (error) throw new Error(`Media restore failed: ${error.message}`);
    }

    for (const file of manifest.resumeFiles ?? []) {
      const absoluteFile = path.resolve(input, file.file);
      const relative = path.relative(input, absoluteFile);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Unsafe resume path in manifest: ${file.file}`);
      }
      const buffer = await readFile(absoluteFile);
      const checksum = createHash("sha256").update(buffer).digest("hex");
      if (checksum !== file.sha256 || buffer.byteLength !== file.sizeBytes) {
        throw new Error(`Resume checksum mismatch: ${file.file}`);
      }
      const asset = manifest.resumeAssets?.find(
        ({ id }) => id === file.resumeAssetId,
      );
      if (!asset) {
        throw new Error(`Missing resume metadata: ${file.resumeAssetId}`);
      }
      const { error } = await supabase.storage
        .from(file.bucket)
        .upload(file.objectPath, buffer, {
          contentType: "application/pdf",
          cacheControl: "31536000",
          upsert: true,
        });
      if (error) throw new Error(`Resume restore failed: ${error.message}`);
    }

    for (const admin of manifest.adminUsers) {
      await db.adminUser.upsert({
        where: { userId: admin.userId },
        update: { email: admin.email, updatedAt: date(admin.updatedAt) },
        create: {
          userId: admin.userId,
          email: admin.email,
          createdAt: date(admin.createdAt),
          updatedAt: date(admin.updatedAt),
        },
      });
    }

    for (const asset of manifest.mediaAssets) {
      const data = {
        bucket: asset.bucket,
        objectPath: asset.objectPath,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        width: asset.width,
        height: asset.height,
        blurDataUrl: asset.blurDataUrl,
        status: asset.status as MediaStatus,
        createdBy: asset.createdBy,
        updatedAt: date(asset.updatedAt),
      };
      await db.mediaAsset.upsert({
        where: { id: asset.id },
        update: data,
        create: { id: asset.id, ...data, createdAt: date(asset.createdAt) },
      });
    }

    for (const asset of manifest.resumeAssets ?? []) {
      const data = {
        bucket: asset.bucket,
        objectPath: asset.objectPath,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        createdBy: asset.createdBy,
        updatedAt: date(asset.updatedAt),
      };
      await db.resumeAsset.upsert({
        where: { id: asset.id },
        update: data,
        create: { id: asset.id, ...data, createdAt: date(asset.createdAt) },
      });
    }

    for (const skill of manifest.skills) {
      const data = {
        slug: skill.slug,
        name: skill.name,
        category: skill.category as SkillCategory,
        showOnHome: skill.showOnHome,
        sortOrder: skill.sortOrder,
        status: skill.status as ContentStatus,
        archivedAt: optionalDate(skill.archivedAt),
        updatedAt: date(skill.updatedAt),
      };
      await db.skill.upsert({
        where: { id: skill.id },
        update: data,
        create: { id: skill.id, ...data, createdAt: date(skill.createdAt) },
      });
    }

    for (const experience of manifest.experiences) {
      const highlights = experience.highlights.map((item) => ({ ...item }));
      const data = {
        slug: experience.slug,
        company: experience.company,
        role: experience.role,
        type: experience.type,
        summary: experience.summary,
        startDate: date(experience.startDate),
        endDate: optionalDate(experience.endDate),
        isCurrent: experience.isCurrent,
        durationLabel: experience.durationLabel,
        monogram: experience.monogram,
        sortOrder: experience.sortOrder,
        status: experience.status as ContentStatus,
        coverMediaId: experience.coverMediaId,
        imageAlt: experience.imageAlt,
        archivedAt: optionalDate(experience.archivedAt),
        updatedAt: date(experience.updatedAt),
      };
      await db.experience.upsert({
        where: { id: experience.id },
        update: {
          ...data,
          highlights: { deleteMany: {}, create: highlights },
        },
        create: {
          id: experience.id,
          ...data,
          createdAt: date(experience.createdAt),
          highlights: { create: highlights },
        },
      });
    }

    for (const project of manifest.projects) {
      const nested = {
        highlights: { create: project.highlights.map((item) => ({ ...item })) },
        contributions: {
          create: project.contributions.map((item) => ({ ...item })),
        },
        impacts: { create: project.impacts.map((item) => ({ ...item })) },
        impactStats: {
          create: project.impactStats.map((item) => ({ ...item })),
        },
        skills: { create: project.skills.map((item) => ({ ...item })) },
        media: { create: project.media.map((item) => ({ ...item })) },
      };
      const data = {
        slug: project.slug,
        title: project.title,
        role: project.role,
        category: project.category as ProjectCategory,
        summary: project.summary,
        liveUrl: project.liveUrl,
        featured: project.featured,
        sortOrder: project.sortOrder,
        status: project.status as ContentStatus,
        relatedExperienceId: project.relatedExperienceId,
        impactSummary: project.impactSummary,
        publishedAt: date(project.publishedAt),
        archivedAt: optionalDate(project.archivedAt),
        updatedAt: date(project.updatedAt),
      };
      await db.project.upsert({
        where: { id: project.id },
        update: {
          ...data,
          highlights: { deleteMany: {}, ...nested.highlights },
          contributions: { deleteMany: {}, ...nested.contributions },
          impacts: { deleteMany: {}, ...nested.impacts },
          impactStats: { deleteMany: {}, ...nested.impactStats },
          skills: { deleteMany: {}, ...nested.skills },
          media: { deleteMany: {}, ...nested.media },
        },
        create: {
          id: project.id,
          ...data,
          createdAt: date(project.createdAt),
          ...nested,
        },
      });
    }

    process.stdout.write(
      `${JSON.stringify(
        {
          restoredFrom: input,
          checksum: manifest.checksum,
          projects: manifest.projects.length,
          experiences: manifest.experiences.length,
          skills: manifest.skills.length,
          mediaFiles: manifest.mediaFiles.length,
          resumeFiles: manifest.resumeFiles?.length ?? 0,
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
    `CMS restore failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
