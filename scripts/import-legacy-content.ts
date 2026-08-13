import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import experiencesFixture from "../prisma/seed/experiences.v1.json";
import projectsFixture from "../prisma/seed/projects.v1.json";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ContentStatus,
  MediaStatus,
  ProjectCategory,
  SkillCategory,
} from "../src/generated/prisma/enums";
import { createSlug } from "../src/domain/content/format";
import {
  assertUniqueLegacySlugs,
  buildSkillUnion,
  parseLegacyPeriod,
  sourceChecksum,
} from "../src/domain/migration/legacy";
import { mediaPolicy } from "../src/domain/media/policy";

interface LegacyImage {
  src: string;
  alt: string;
  label: string;
  description: string;
}

interface LegacyProject {
  id: string;
  name: string;
  role: string;
  category: "frontend" | "backend" | "fullstack";
  featured: boolean;
  experienceId?: string;
  summary: string;
  contributions?: string[];
  impactSummary?: string;
  impactStats?: Array<{ value: string; label: string }>;
  impacts?: string[];
  highlights: string[];
  techStack: string[];
  images: LegacyImage[];
  link: string | null;
}

interface LegacyExperience {
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  duration: string;
  summary: string;
  highlights: string[];
  image: string | null;
  imageAlt: string;
  monogram: string;
}

const projects = projectsFixture as LegacyProject[];
const experiences = experiencesFixture as LegacyExperience[];
const apply = process.argv.includes("--apply");

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function publicFile(sourcePath: string) {
  return path.join(process.cwd(), "public", sourcePath.replace(/^\//, ""));
}

async function validateSources() {
  assertUniqueLegacySlugs(projects, "Projects");
  assertUniqueLegacySlugs(experiences, "Experiences");
  const experienceSlugs = new Set(experiences.map(({ id }) => id));
  const sourcePaths = [
    ...experiences.flatMap(({ image }) => (image ? [image] : [])),
    ...projects.flatMap(({ images }) => images.map(({ src }) => src)),
  ];

  for (const project of projects) {
    if (project.experienceId && !experienceSlugs.has(project.experienceId)) {
      throw new Error(
        `Project ${project.id} references missing experience ${project.experienceId}.`,
      );
    }
    if (!project.highlights.length || !project.techStack.length || !project.images.length) {
      throw new Error(`Project ${project.id} is not publishable.`);
    }
  }

  const files = [];
  for (const sourcePath of sourcePaths) {
    const absolutePath = publicFile(sourcePath);
    const input = await readFile(absolutePath);
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Cannot read image dimensions: ${sourcePath}`);
    }
    files.push({
      sourcePath,
      bytes: input.byteLength,
      width: metadata.width,
      height: metadata.height,
      checksum: createHash("sha256").update(input).digest("hex"),
    });
  }

  return files;
}

async function optimizeImage(sourcePath: string) {
  const input = await readFile(publicFile(sourcePath));
  let quality = 86;
  let output = Buffer.alloc(0);

  while (quality >= 54) {
    output = await sharp(input)
      .rotate()
      .resize({
        width: mediaPolicy.maxDimension,
        height: mediaPolicy.maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
    if (output.byteLength <= mediaPolicy.targetBytes) break;
    quality -= 8;
  }
  if (output.byteLength > mediaPolicy.targetBytes) {
    throw new Error(`Optimized image still exceeds 2 MB: ${sourcePath}`);
  }
  const metadata = await sharp(output).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Optimized image has no dimensions: ${sourcePath}`);
  }
  return {
    output,
    width: metadata.width,
    height: metadata.height,
    checksum: createHash("sha256").update(output).digest("hex"),
  };
}

function databaseCategory(category: LegacyProject["category"]) {
  return category.toUpperCase() as ProjectCategory;
}

async function runImport(sourceFiles: Awaited<ReturnType<typeof validateSources>>) {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = requiredEnv("SUPABASE_SECRET_KEY");
  const adminUserId = requiredEnv("ADMIN_USER_ID");
  const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase();
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl, max: 2 }),
  });
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const importedPaths: string[] = [];

  async function importMedia(sourcePath: string, scope: string) {
    const optimized = await optimizeImage(sourcePath);
    const originalName = path.basename(sourcePath);
    const safeName = createSlug(path.parse(originalName).name) || "image";
    const objectPath = `${adminUserId}/legacy/${scope}/${safeName}-${optimized.checksum.slice(0, 12)}.webp`;
    const { error } = await supabase.storage
      .from(mediaPolicy.bucket)
      .upload(objectPath, optimized.output, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) throw new Error(`Storage upload failed for ${sourcePath}: ${error.message}`);

    const asset = await db.mediaAsset.upsert({
      where: { objectPath },
      update: {
        originalName,
        mimeType: "image/webp",
        sizeBytes: optimized.output.byteLength,
        width: optimized.width,
        height: optimized.height,
        status: MediaStatus.READY,
      },
      create: {
        bucket: mediaPolicy.bucket,
        objectPath,
        originalName,
        mimeType: "image/webp",
        sizeBytes: optimized.output.byteLength,
        width: optimized.width,
        height: optimized.height,
        status: MediaStatus.READY,
        createdBy: adminUserId,
      },
    });
    importedPaths.push(objectPath);
    return asset;
  }

  try {
    const { error: bucketError } = await supabase.storage.getBucket(mediaPolicy.bucket);
    if (bucketError) {
      const { error: createError } = await supabase.storage.createBucket(
        mediaPolicy.bucket,
        {
          public: true,
          fileSizeLimit: mediaPolicy.maxInputBytes,
          allowedMimeTypes: [...mediaPolicy.allowedImageTypes],
        },
      );
      if (createError) throw new Error(`Bucket bootstrap failed: ${createError.message}`);
    }

    await db.adminUser.upsert({
      where: { userId: adminUserId },
      update: { email: adminEmail },
      create: { userId: adminUserId, email: adminEmail },
    });

    const skillPlan = buildSkillUnion(projects.map(({ techStack }) => techStack));
    const skillIds = new Map<string, string>();
    for (const skill of skillPlan) {
      const record = await db.skill.upsert({
        where: { slug: skill.slug },
        update: {
          name: skill.name,
          category: skill.category.toUpperCase() as SkillCategory,
          showOnHome: skill.showOnHome,
          sortOrder: skill.sortOrder,
          status: ContentStatus.ACTIVE,
          archivedAt: null,
        },
        create: {
          ...skill,
          category: skill.category.toUpperCase() as SkillCategory,
          status: ContentStatus.ACTIVE,
        },
      });
      skillIds.set(skill.slug, record.id);
    }

    const experienceIds = new Map<string, string>();
    for (const [sortOrder, experience] of experiences.entries()) {
      const period = parseLegacyPeriod(experience.period);
      const cover = experience.image
        ? await importMedia(experience.image, `experiences/${experience.id}`)
        : null;
      const record = await db.experience.upsert({
        where: { slug: experience.id },
        update: {
          company: experience.company,
          role: experience.role,
          type: experience.type,
          summary: experience.summary,
          ...period,
          durationLabel: experience.duration,
          monogram: experience.monogram,
          sortOrder,
          status: ContentStatus.ACTIVE,
          archivedAt: null,
          coverMediaId: cover?.id ?? null,
          imageAlt: cover ? experience.imageAlt : null,
          highlights: {
            deleteMany: {},
            create: experience.highlights.map((text, position) => ({ text, position })),
          },
        },
        create: {
          slug: experience.id,
          company: experience.company,
          role: experience.role,
          type: experience.type,
          summary: experience.summary,
          ...period,
          durationLabel: experience.duration,
          monogram: experience.monogram,
          sortOrder,
          coverMediaId: cover?.id ?? null,
          imageAlt: cover ? experience.imageAlt : null,
          highlights: {
            create: experience.highlights.map((text, position) => ({ text, position })),
          },
        },
      });
      experienceIds.set(experience.id, record.id);
    }

    for (const [sortOrder, project] of projects.entries()) {
      const media = [];
      for (const [position, image] of project.images.entries()) {
        const asset = await importMedia(image.src, `projects/${project.id}`);
        media.push({
          mediaAssetId: asset.id,
          altText: image.alt,
          label: image.label,
          description: image.description,
          position,
          isCover: position === 0,
        });
      }
      const relatedExperienceId = project.experienceId
        ? experienceIds.get(project.experienceId)
        : undefined;
      const skillRelations = project.techStack.map((name, position) => {
        const skillId = skillIds.get(createSlug(name));
        if (!skillId) throw new Error(`Skill was not imported: ${name}`);
        return { skillId, position };
      });
      const nested = {
        highlights: {
          deleteMany: {},
          create: project.highlights.map((text, position) => ({ text, position })),
        },
        contributions: {
          deleteMany: {},
          create: (project.contributions ?? []).map((text, position) => ({ text, position })),
        },
        impacts: {
          deleteMany: {},
          create: (project.impacts ?? []).map((text, position) => ({ text, position })),
        },
        impactStats: {
          deleteMany: {},
          create: (project.impactStats ?? []).map((stat, position) => ({ ...stat, position })),
        },
        skills: { deleteMany: {}, create: skillRelations },
        media: { deleteMany: {}, create: media },
      };
      await db.project.upsert({
        where: { slug: project.id },
        update: {
          title: project.name,
          role: project.role,
          category: databaseCategory(project.category),
          summary: project.summary,
          liveUrl: project.link,
          featured: project.featured,
          sortOrder,
          status: ContentStatus.ACTIVE,
          archivedAt: null,
          relatedExperienceId: relatedExperienceId ?? null,
          impactSummary: project.impactSummary ?? null,
          ...nested,
        },
        create: {
          slug: project.id,
          title: project.name,
          role: project.role,
          category: databaseCategory(project.category),
          summary: project.summary,
          liveUrl: project.link,
          featured: project.featured,
          sortOrder,
          relatedExperienceId: relatedExperienceId ?? null,
          impactSummary: project.impactSummary ?? null,
          highlights: { create: nested.highlights.create },
          contributions: { create: nested.contributions.create },
          impacts: { create: nested.impacts.create },
          impactStats: { create: nested.impactStats.create },
          skills: { create: skillRelations },
          media: { create: media },
        },
      });
    }

    const uniquePaths = [...new Set(importedPaths)];
    const missingObjects = [];
    for (const objectPath of uniquePaths) {
      const separator = objectPath.lastIndexOf("/");
      const directory = objectPath.slice(0, separator);
      const fileName = objectPath.slice(separator + 1);
      const { data, error } = await supabase.storage
        .from(mediaPolicy.bucket)
        .list(directory, { search: fileName, limit: 2 });
      if (error || !data?.some((item) => item.name === fileName)) {
        missingObjects.push(objectPath);
      }
    }

    const [projectCount, experienceCount, skillCount, mediaCount] = await Promise.all([
      db.project.count(),
      db.experience.count(),
      db.skill.count(),
      db.mediaAsset.count(),
    ]);
    const report = {
      mode: "apply",
      fixtureVersion: 1,
      sourceChecksum: sourceChecksum({ projects, experiences }),
      sourceFiles,
      database: { projectCount, experienceCount, skillCount, mediaCount },
      storage: { verified: uniquePaths.length - missingObjects.length, missingObjects },
      generatedAt: new Date().toISOString(),
    };
    if (missingObjects.length) {
      throw new Error(`Storage verification failed for ${missingObjects.length} objects.`);
    }
    await mkdir(path.join(process.cwd(), "backups"), { recursive: true });
    await writeFile(
      path.join(process.cwd(), "backups", "legacy-import-report.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await db.$disconnect();
  }
}

async function main() {
  const sourceFiles = await validateSources();
  const plan = {
    mode: apply ? "apply" : "dry-run",
    fixtureVersion: 1,
    sourceChecksum: sourceChecksum({ projects, experiences }),
    projects: projects.length,
    experiences: experiences.length,
    skills: buildSkillUnion(projects.map(({ techStack }) => techStack)).length,
    mediaFiles: sourceFiles.length,
    localOnly: ["/iqmal.png", "/icon.svg", "/resume.pdf"],
  };

  if (apply) {
    await runImport(sourceFiles);
  } else {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    process.stdout.write(
      "Dry run complete. Re-run with --apply after configuring Supabase.\n",
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Legacy import failed: ${message}\n`);
  process.exitCode = 1;
});
