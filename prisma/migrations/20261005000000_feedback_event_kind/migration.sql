-- Feedback form submissions get their own event kind, so they no longer count as scans.
ALTER TYPE "ScanEventKind" ADD VALUE IF NOT EXISTS 'FEEDBACK';
