type Level = 'debug' | 'info' | 'warn' | 'error';

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel: Level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  if (order[level] < order[minLevel]) return;
  const line = {
    t: new Date().toISOString(),
    level,
    msg: message,
    ...(meta ?? {}),
  };
  const serialized = JSON.stringify(line, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
  if (level === 'error') console.error(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
};
