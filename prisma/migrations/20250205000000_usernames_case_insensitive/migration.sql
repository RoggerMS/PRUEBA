-- Enforce case-insensitive uniqueness for usernames
BEGIN;

-- 1) Resolve case-insensitive collisions by keeping the oldest username and renaming others with suffix -{n}
WITH duplicates AS (
  SELECT id, username, LOWER(username) AS lower_name,
         ROW_NUMBER() OVER (PARTITION BY LOWER(username) ORDER BY "createdAt") AS rn
  FROM "User"
)
UPDATE "User" u
SET username = d.lower_name || '-' || d.rn
FROM duplicates d
WHERE u.id = d.id AND d.rn > 1;

-- 2) Force all usernames to lowercase
UPDATE "User" SET username = LOWER(username);

-- 3) Create unique index on lower(username)
DROP INDEX IF EXISTS users_username_lower_idx;
CREATE UNIQUE INDEX users_username_lower_idx ON "User"(LOWER(username));

COMMIT;
