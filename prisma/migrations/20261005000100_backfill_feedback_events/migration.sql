-- Earlier submissions were stored as SCAN events carrying meta.feedback; reclassify them.
-- (Separate migration: Postgres cannot use a new enum value in the transaction that adds it.)
UPDATE "ScanEvent" SET "kind" = 'FEEDBACK' WHERE "kind" = 'SCAN' AND "meta" ? 'feedback';
