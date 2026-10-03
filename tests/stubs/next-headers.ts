/**
 * Minimal stand-in for `next/headers` so server modules can be imported in tests.
 * The cookie store is per-process and in-memory; tests that care about cookie behaviour
 * assert against it directly.
 */

interface StoredCookie {
  name: string;
  value: string;
}

const store = new Map<string, string>();

export const testCookieStore = {
  all(): StoredCookie[] {
    return Array.from(store.entries()).map(([name, value]) => ({ name, value }));
  },
  reset(): void {
    store.clear();
  },
};

export async function cookies() {
  return {
    get(name: string): StoredCookie | undefined {
      const value = store.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set(name: string, value: string): void {
      store.set(name, value);
    },
    delete(name: string): void {
      store.delete(name);
    },
    getAll(): StoredCookie[] {
      return testCookieStore.all();
    },
  };
}

export async function headers() {
  return new Headers();
}
