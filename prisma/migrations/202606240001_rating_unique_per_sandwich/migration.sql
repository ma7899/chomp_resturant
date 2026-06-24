-- One rating per user per sandwich (edit in place instead of duplicate rows)
DROP INDEX IF EXISTS "SandwichRating_userId_orderId_sandwichId_key";
CREATE UNIQUE INDEX "SandwichRating_userId_sandwichId_key"
ON "SandwichRating"("userId", "sandwichId");
