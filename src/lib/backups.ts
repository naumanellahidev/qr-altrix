import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Backup visibility for the admin panel.
 *
 * Backups are taken by `scripts/backup.sh` (cron on the host), not by the app — a process
 * that can delete its own backups is not a backup system. The app only reads the
 * directory so an administrator can see, at a glance, whether anything is actually
 * running. A dynamic QR code is only as permanent as its last good dump.
 */

export interface BackupFile {
  name: string;
  sizeBytes: number;
  modifiedAt: string;
  ageHours: number;
}

export interface BackupStatus {
  directory: string;
  exists: boolean;
  latestDatabase: BackupFile | null;
  latestStorage: BackupFile | null;
  count: number;
  totalBytes: number;
  /** ok = fresh, stale = older than the warning window, missing = nothing found. */
  state: 'ok' | 'stale' | 'missing';
  staleAfterHours: number;
}

const STALE_AFTER_HOURS = 48;

function toFile(name: string, size: number, modified: Date): BackupFile {
  return {
    name,
    sizeBytes: size,
    modifiedAt: modified.toISOString(),
    ageHours: Math.max(0, Math.round(((Date.now() - modified.getTime()) / 36e5) * 10) / 10),
  };
}

export async function backupStatus(): Promise<BackupStatus> {
  const directory = path.resolve(process.cwd(), process.env.BACKUP_DIR ?? './backups');

  const base: BackupStatus = {
    directory,
    exists: false,
    latestDatabase: null,
    latestStorage: null,
    count: 0,
    totalBytes: 0,
    state: 'missing',
    staleAfterHours: STALE_AFTER_HOURS,
  };

  let entries: string[];
  try {
    entries = await fs.readdir(directory);
  } catch {
    return base;
  }

  const files: { name: string; size: number; modified: Date }[] = [];
  for (const name of entries) {
    if (!/^(db|storage)-.*\.(dump|tar\.gz)$/.test(name)) continue;
    try {
      const stat = await fs.stat(path.join(directory, name));
      if (stat.isFile()) files.push({ name, size: stat.size, modified: stat.mtime });
    } catch {
      /* a file that vanished mid-listing is not worth failing over */
    }
  }

  const databases = files
    .filter((file) => file.name.startsWith('db-'))
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());
  const storage = files
    .filter((file) => file.name.startsWith('storage-'))
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());

  const latestDatabase = databases[0] ? toFile(databases[0].name, databases[0].size, databases[0].modified) : null;
  const latestStorage = storage[0] ? toFile(storage[0].name, storage[0].size, storage[0].modified) : null;

  return {
    directory,
    exists: true,
    latestDatabase,
    latestStorage,
    count: files.length,
    totalBytes: files.reduce((total, file) => total + file.size, 0),
    state: !latestDatabase ? 'missing' : latestDatabase.ageHours > STALE_AFTER_HOURS ? 'stale' : 'ok',
    staleAfterHours: STALE_AFTER_HOURS,
  };
}
