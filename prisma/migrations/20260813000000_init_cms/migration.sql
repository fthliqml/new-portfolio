-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cms";

-- CreateEnum
CREATE TYPE "cms"."ContentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "cms"."ProjectCategory" AS ENUM ('FRONTEND', 'BACKEND', 'FULLSTACK');

-- CreateEnum
CREATE TYPE "cms"."SkillCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLS', 'OTHER');

-- CreateEnum
CREATE TYPE "cms"."MediaStatus" AS ENUM ('PENDING', 'READY');

-- CreateTable
CREATE TABLE "cms"."admin_users" (
    "user_id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "cms"."projects" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "role" VARCHAR(120) NOT NULL,
    "category" "cms"."ProjectCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "live_url" VARCHAR(2048),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "cms"."ContentStatus" NOT NULL DEFAULT 'ACTIVE',
    "related_experience_id" UUID,
    "impact_summary" TEXT,
    "published_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_highlights" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "project_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_contributions" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "project_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_impacts" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "project_impacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_impact_stats" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "value" VARCHAR(80) NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "project_impact_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."experiences" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "company" VARCHAR(180) NOT NULL,
    "role" VARCHAR(140) NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "summary" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "monogram" VARCHAR(8) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "cms"."ContentStatus" NOT NULL DEFAULT 'ACTIVE',
    "cover_media_id" UUID,
    "image_alt" VARCHAR(320),
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."experience_highlights" (
    "id" UUID NOT NULL,
    "experience_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "experience_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."skills" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "category" "cms"."SkillCategory" NOT NULL,
    "show_on_home" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "cms"."ContentStatus" NOT NULL DEFAULT 'ACTIVE',
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_skills" (
    "project_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("project_id","skill_id")
);

-- CreateTable
CREATE TABLE "cms"."media_assets" (
    "id" UUID NOT NULL,
    "bucket" VARCHAR(100) NOT NULL DEFAULT 'portfolio-media',
    "object_path" VARCHAR(1024) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blur_data_url" TEXT,
    "status" "cms"."MediaStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms"."project_media" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "alt_text" VARCHAR(320) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "project_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "cms"."admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "cms"."projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_sort_order_idx" ON "cms"."projects"("status", "sort_order");

-- CreateIndex
CREATE INDEX "projects_status_featured_sort_order_idx" ON "cms"."projects"("status", "featured", "sort_order");

-- CreateIndex
CREATE INDEX "projects_category_status_idx" ON "cms"."projects"("category", "status");

-- CreateIndex
CREATE INDEX "projects_related_experience_id_idx" ON "cms"."projects"("related_experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_highlights_project_id_position_key" ON "cms"."project_highlights"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "project_contributions_project_id_position_key" ON "cms"."project_contributions"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "project_impacts_project_id_position_key" ON "cms"."project_impacts"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "project_impact_stats_project_id_position_key" ON "cms"."project_impact_stats"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_slug_key" ON "cms"."experiences"("slug");

-- CreateIndex
CREATE INDEX "experiences_status_sort_order_idx" ON "cms"."experiences"("status", "sort_order");

-- CreateIndex
CREATE INDEX "experiences_cover_media_id_idx" ON "cms"."experiences"("cover_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "experience_highlights_experience_id_position_key" ON "cms"."experience_highlights"("experience_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "cms"."skills"("slug");

-- CreateIndex
CREATE INDEX "skills_status_show_on_home_sort_order_idx" ON "cms"."skills"("status", "show_on_home", "sort_order");

-- CreateIndex
CREATE INDEX "project_skills_skill_id_idx" ON "cms"."project_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_skills_project_id_position_key" ON "cms"."project_skills"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_object_path_key" ON "cms"."media_assets"("object_path");

-- CreateIndex
CREATE INDEX "media_assets_status_created_at_idx" ON "cms"."media_assets"("status", "created_at");

-- CreateIndex
CREATE INDEX "media_assets_created_by_idx" ON "cms"."media_assets"("created_by");

-- CreateIndex
CREATE INDEX "project_media_media_asset_id_idx" ON "cms"."project_media"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_media_project_id_position_key" ON "cms"."project_media"("project_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "project_media_project_id_media_asset_id_key" ON "cms"."project_media"("project_id", "media_asset_id");

-- AddForeignKey
ALTER TABLE "cms"."projects" ADD CONSTRAINT "projects_related_experience_id_fkey" FOREIGN KEY ("related_experience_id") REFERENCES "cms"."experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_highlights" ADD CONSTRAINT "project_highlights_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_contributions" ADD CONSTRAINT "project_contributions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_impacts" ADD CONSTRAINT "project_impacts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_impact_stats" ADD CONSTRAINT "project_impact_stats_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."experiences" ADD CONSTRAINT "experiences_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "cms"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."experience_highlights" ADD CONSTRAINT "experience_highlights_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "cms"."experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_skills" ADD CONSTRAINT "project_skills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_skills" ADD CONSTRAINT "project_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "cms"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."media_assets" ADD CONSTRAINT "media_assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "cms"."admin_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_media" ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "cms"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms"."project_media" ADD CONSTRAINT "project_media_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "cms"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain checks that Prisma models but cannot currently express in the schema.
ALTER TABLE "cms"."projects"
    ADD CONSTRAINT "projects_sort_order_nonnegative" CHECK ("sort_order" >= 0);

ALTER TABLE "cms"."experiences"
    ADD CONSTRAINT "experiences_sort_order_nonnegative" CHECK ("sort_order" >= 0),
    ADD CONSTRAINT "experiences_date_range_valid" CHECK (
        ("is_current" = true AND "end_date" IS NULL)
        OR
        ("is_current" = false AND "end_date" IS NOT NULL AND "end_date" >= "start_date")
    );

ALTER TABLE "cms"."skills"
    ADD CONSTRAINT "skills_sort_order_nonnegative" CHECK ("sort_order" >= 0);

ALTER TABLE "cms"."project_highlights"
    ADD CONSTRAINT "project_highlights_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."project_contributions"
    ADD CONSTRAINT "project_contributions_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."project_impacts"
    ADD CONSTRAINT "project_impacts_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."project_impact_stats"
    ADD CONSTRAINT "project_impact_stats_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."experience_highlights"
    ADD CONSTRAINT "experience_highlights_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."project_skills"
    ADD CONSTRAINT "project_skills_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."project_media"
    ADD CONSTRAINT "project_media_position_nonnegative" CHECK ("position" >= 0);

ALTER TABLE "cms"."media_assets"
    ADD CONSTRAINT "media_assets_dimensions_positive" CHECK (
        "size_bytes" > 0 AND "width" > 0 AND "height" > 0
    );

CREATE UNIQUE INDEX "project_media_one_cover_per_project"
    ON "cms"."project_media" ("project_id")
    WHERE "is_cover" = true;

CREATE UNIQUE INDEX "admin_users_email_case_insensitive_key"
    ON "cms"."admin_users" (LOWER("email"));

REVOKE ALL ON SCHEMA "cms" FROM PUBLIC;
