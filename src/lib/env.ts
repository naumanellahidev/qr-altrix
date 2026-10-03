/**
 * Environment access. Values are read lazily so that `next build` works without a
 * fully populated .env, while runtime code still gets validated values.
 */

function str(key: string, fallback = ''): string {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
}

function bool(key: string, fallback = false): boolean {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

function int(key: string, fallback: number): number {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const env = {
  get nodeEnv() {
    return str('NODE_ENV', 'development');
  },
  get isProduction() {
    return this.nodeEnv === 'production';
  },
  get appName() {
    return str('APP_NAME', 'QR ALTRIX');
  },
  get appUrl() {
    return stripTrailingSlash(str('APP_URL', `http://localhost:${int('PORT', 3000)}`));
  },
  get shortUrlBase() {
    return stripTrailingSlash(str('SHORT_URL_BASE', this.appUrl));
  },
  get databaseUrl() {
    return str('DATABASE_URL');
  },
  get redisUrl() {
    return str('REDIS_URL');
  },
  get authSecret() {
    const secret = str('AUTH_SECRET');
    if (secret) return secret;
    if (this.isProduction) {
      throw new Error('AUTH_SECRET must be set in production');
    }
    return 'qr-altrix-development-secret-do-not-use-in-production';
  },
  get ipHashSalt() {
    return str('IP_HASH_SALT', 'qr-altrix-dev-ip-salt');
  },
  get smtp() {
    return {
      host: str('SMTP_HOST'),
      port: int('SMTP_PORT', 587),
      secure: bool('SMTP_SECURE', false),
      user: str('SMTP_USER'),
      password: str('SMTP_PASSWORD'),
      from: str('MAIL_FROM', 'QR ALTRIX <no-reply@localhost>'),
    };
  },
  get google() {
    return {
      clientId: str('GOOGLE_CLIENT_ID'),
      clientSecret: str('GOOGLE_CLIENT_SECRET'),
      get enabled() {
        return Boolean(this.clientId && this.clientSecret);
      },
    };
  },
  get storage() {
    return {
      driver: str('STORAGE_DRIVER', 'local') as 'local' | 's3',
      localDir: str('STORAGE_LOCAL_DIR', './storage'),
      maxUploadMb: int('MAX_UPLOAD_MB', 15),
      s3: {
        endpoint: str('S3_ENDPOINT'),
        region: str('S3_REGION', 'auto'),
        bucket: str('S3_BUCKET'),
        accessKeyId: str('S3_ACCESS_KEY_ID'),
        secretAccessKey: str('S3_SECRET_ACCESS_KEY'),
        publicBaseUrl: stripTrailingSlash(str('S3_PUBLIC_BASE_URL')),
        forcePathStyle: bool('S3_FORCE_PATH_STYLE', true),
      },
    };
  },
  get allowGuestStaticDownload() {
    return bool('ALLOW_GUEST_STATIC_DOWNLOAD', true);
  },
  get analyticsRetentionDays() {
    return int('ANALYTICS_RETENTION_DAYS', 0);
  },
  get ipStorageMode() {
    return str('IP_STORAGE_MODE', 'hashed') as 'hashed' | 'never';
  },
  get rateLimits() {
    return {
      apiPerMin: int('RATE_LIMIT_API_PER_MIN', 120),
      authPerMin: int('RATE_LIMIT_AUTH_PER_MIN', 10),
    };
  },
  get bulkMaxRows() {
    return int('BULK_MAX_ROWS', 20000);
  },
  get workerConcurrency() {
    return int('WORKER_CONCURRENCY', 5);
  },
};

export type Env = typeof env;
