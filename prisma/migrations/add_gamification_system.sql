-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_counters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE INDEX "badges_rarity_idx" ON "badges"("rarity");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE INDEX "achievements_badgeId_idx" ON "achievements"("badgeId");

-- CreateIndex
CREATE INDEX "achievements_eventType_idx" ON "achievements"("eventType");

-- CreateIndex
CREATE INDEX "achievements_isActive_idx" ON "achievements"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_isCompleted_idx" ON "user_badges"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "progress_counters_userId_eventType_key" ON "progress_counters"("userId", "eventType");

-- CreateIndex
CREATE INDEX "progress_counters_userId_idx" ON "progress_counters"("userId");

-- CreateIndex
CREATE INDEX "progress_counters_eventType_idx" ON "progress_counters"("eventType");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_eventType_idx" ON "activities"("eventType");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_counters" ADD CONSTRAINT "progress_counters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert initial badge data
INSERT INTO "badges" ("id", "name", "description", "icon", "rarity", "points") VALUES
('badge_first_post', 'Primera Publicación', 'Realizaste tu primera publicación', '📝', 'COMMON', 10),
('badge_social_butterfly', 'Mariposa Social', 'Siguiste a 10 usuarios', '🦋', 'COMMON', 25),
('badge_content_creator', 'Creador de Contenido', 'Publicaste 50 posts', '✨', 'RARE', 100),
('badge_community_leader', 'Líder Comunitario', 'Obtuviste 100 seguidores', '👑', 'EPIC', 250),
('badge_legend', 'Leyenda', 'Alcanzaste nivel 50', '🏆', 'LEGENDARY', 500);

-- Insert initial achievements
INSERT INTO "achievements" ("id", "name", "description", "icon", "badgeId", "targetValue", "eventType") VALUES
('achievement_first_post', 'Primera Publicación', 'Realiza tu primera publicación', '📝', 'badge_first_post', 1, 'post_created'),
('achievement_social_butterfly', 'Mariposa Social', 'Sigue a 10 usuarios', '🦋', 'badge_social_butterfly', 10, 'user_followed'),
('achievement_content_creator', 'Creador de Contenido', 'Publica 50 posts', '✨', 'badge_content_creator', 50, 'post_created'),
('achievement_community_leader', 'Líder Comunitario', 'Obtén 100 seguidores', '👑', 'badge_community_leader', 100, 'user_gained_follower'),
('achievement_legend', 'Leyenda', 'Alcanza nivel 50', '🏆', 'badge_legend', 50, 'level_reached');