-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fire',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "uploaderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "post_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "media_comments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "media_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hashtags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "post_hashtags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "hashtagId" TEXT NOT NULL,
    CONSTRAINT "post_hashtags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_hashtags_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "hashtags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_mentions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "mentionedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_mentions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_mentions_mentionedId_fkey" FOREIGN KEY ("mentionedId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "post_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_shares_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "post_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_mentions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "mentionedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_mentions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_mentions_mentionedId_fkey" FOREIGN KEY ("mentionedId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_feed_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "showFollowingFirst" BOOLEAN NOT NULL DEFAULT true,
    "showMediaPosts" BOOLEAN NOT NULL DEFAULT true,
    "showQuestionPosts" BOOLEAN NOT NULL DEFAULT true,
    "showNotePosts" BOOLEAN NOT NULL DEFAULT true,
    "autoplayVideos" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_feed_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "marketplace_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "marketplace_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "marketplace_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "price" INTEGER NOT NULL,
    "priceInSoles" REAL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "category" TEXT NOT NULL,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "ruleConfig" JSONB NOT NULL,
    "badgeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "achievements_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "achievementId" TEXT,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progress_counters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_counters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpGained" INTEGER DEFAULT 0,
    "crolars" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "editedAt" DATETIME,
    "authorId" TEXT NOT NULL,
    "postId" TEXT,
    "noteId" TEXT,
    "parentId" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("authorId", "content", "createdAt", "id", "noteId", "parentId", "postId", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "noteId", "parentId", "postId", "updatedAt" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE INDEX "comments_postId_idx" ON "comments"("postId");
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");
CREATE INDEX "comments_path_idx" ON "comments"("path");
CREATE TABLE "new_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "attachments" TEXT,
    "tags" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_posts" ("attachments", "authorId", "content", "createdAt", "id", "imageUrl", "isPinned", "tags", "type", "updatedAt", "videoUrl", "visibility") SELECT "attachments", "authorId", "content", "createdAt", "id", "imageUrl", "isPinned", "tags", "type", "updatedAt", "videoUrl", "visibility" FROM "posts";
DROP TABLE "posts";
ALTER TABLE "new_posts" RENAME TO "posts";
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt" DESC);
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "posts_type_idx" ON "posts"("type");
CREATE INDEX "posts_visibility_idx" ON "posts"("visibility");
CREATE INDEX "posts_shareCount_idx" ON "posts"("shareCount" DESC);
CREATE INDEX "posts_viewCount_idx" ON "posts"("viewCount" DESC);
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceInSoles" REAL,
    "images" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sellerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category", "createdAt", "description", "id", "images", "isOfficial", "name", "price", "rating", "ratingCount", "sellerId", "sold", "status", "stock", "tags", "updatedAt") SELECT "category", "createdAt", "description", "id", "images", "isOfficial", "name", "price", "rating", "ratingCount", "sellerId", "sold", "status", "stock", "tags", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "university" TEXT,
    "career" TEXT,
    "semester" INTEGER,
    "graduationYear" INTEGER,
    "interests" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "crolars" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "showActivity" BOOLEAN NOT NULL DEFAULT true,
    "forumNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("allowMessages", "bio", "birthDate", "career", "createdAt", "crolars", "email", "emailNotifications", "emailVerified", "firstName", "gender", "graduationYear", "id", "image", "interests", "isPrivate", "lastActivity", "lastName", "level", "location", "name", "password", "pushNotifications", "role", "semester", "status", "streak", "university", "updatedAt", "username", "verified", "website", "xp") SELECT "allowMessages", "bio", "birthDate", "career", "createdAt", "crolars", "email", "emailNotifications", "emailVerified", "firstName", "gender", "graduationYear", "id", "image", "interests", "isPrivate", "lastActivity", "lastName", "level", "location", "name", "password", "pushNotifications", "role", "semester", "status", "streak", "university", "updatedAt", "username", "verified", "website", "xp" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE TABLE "new_workspace_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "w" INTEGER NOT NULL DEFAULT 300,
    "h" INTEGER NOT NULL DEFAULT 200,
    "zIndex" INTEGER NOT NULL DEFAULT 1,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "boardId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workspace_blocks_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "workspace_boards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_workspace_blocks" ("boardId", "createdAt", "h", "id", "locked", "title", "type", "updatedAt", "w", "x", "y", "zIndex") SELECT "boardId", "createdAt", "h", "id", "locked", "title", "type", "updatedAt", "w", "x", "y", "zIndex" FROM "workspace_blocks";
DROP TABLE "workspace_blocks";
ALTER TABLE "new_workspace_blocks" RENAME TO "workspace_blocks";


-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "comment_likes_commentId_idx" ON "comment_likes"("commentId");

-- CreateIndex
CREATE INDEX "comment_likes_userId_idx" ON "comment_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_likes_userId_commentId_key" ON "comment_likes"("userId", "commentId");

-- CreateIndex
CREATE INDEX "post_reactions_postId_idx" ON "post_reactions"("postId");

-- CreateIndex
CREATE INDEX "post_reactions_userId_idx" ON "post_reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_userId_postId_type_key" ON "post_reactions"("userId", "postId", "type");

-- CreateIndex
CREATE INDEX "media_uploaderId_idx" ON "media"("uploaderId");

-- CreateIndex
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");

-- CreateIndex
CREATE INDEX "post_media_postId_order_idx" ON "post_media"("postId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "post_media_postId_mediaId_key" ON "post_media"("postId", "mediaId");

-- CreateIndex
CREATE INDEX "media_comments_mediaId_idx" ON "media_comments"("mediaId");

-- CreateIndex
CREATE INDEX "media_comments_createdAt_idx" ON "media_comments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_name_key" ON "hashtags"("name");

-- CreateIndex
CREATE INDEX "hashtags_useCount_idx" ON "hashtags"("useCount" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "post_hashtags_postId_hashtagId_key" ON "post_hashtags"("postId", "hashtagId");

-- CreateIndex
CREATE UNIQUE INDEX "post_mentions_postId_mentionedId_key" ON "post_mentions"("postId", "mentionedId");

-- CreateIndex
CREATE INDEX "post_shares_createdAt_idx" ON "post_shares"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_shares_postId_userId_key" ON "post_shares"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_mentions_commentId_mentionedId_key" ON "comment_mentions"("commentId", "mentionedId");

-- CreateIndex
CREATE UNIQUE INDEX "user_feed_settings_userId_key" ON "user_feed_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_categories_name_key" ON "marketplace_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_userId_productId_key" ON "product_reviews"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_favorites_userId_productId_key" ON "product_favorites"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "badges_slug_key" ON "badges"("slug");

-- CreateIndex
CREATE INDEX "badges_category_idx" ON "badges"("category");

-- CreateIndex
CREATE INDEX "badges_rarity_idx" ON "badges"("rarity");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "achievements_ruleType_idx" ON "achievements"("ruleType");

-- CreateIndex
CREATE INDEX "achievements_badgeId_idx" ON "achievements"("badgeId");

-- CreateIndex
CREATE INDEX "achievements_isActive_idx" ON "achievements"("isActive");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_earnedAt_idx" ON "user_badges"("earnedAt");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "progress_counters_userId_idx" ON "progress_counters"("userId");

-- CreateIndex
CREATE INDEX "progress_counters_key_idx" ON "progress_counters"("key");

-- CreateIndex
CREATE INDEX "progress_counters_lastUpdated_idx" ON "progress_counters"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "progress_counters_userId_key_key" ON "progress_counters"("userId", "key");

-- CreateIndex
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_createdAt_idx" ON "Activity"("type", "createdAt");
