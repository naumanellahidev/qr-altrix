/**
 * Shared OAuth constants.
 *
 * These live outside the route files because a Next.js route module may only export
 * handlers and a small set of config values — anything else fails the build.
 */

/** Holds `<state>|<next path>` while the visitor is away at the provider. */
export const OAUTH_STATE_COOKIE = 'qra_oauth';

/** How long a half-finished sign-in stays valid. */
export const OAUTH_STATE_MAX_AGE_SECONDS = 600;
