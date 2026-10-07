-- Platform-wide analytics (admin) read every workspace's scans by time.
CREATE INDEX IF NOT EXISTS "ScanEvent_createdAt_idx" ON "ScanEvent"("createdAt");
