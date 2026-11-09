'use client';

type GoogleFc = { callbackQueue?: Array<Record<string, () => void>>; showRevocationMessage?: () => void };

/**
 * Re-opens Google's consent message (Privacy & messaging) so a visitor can change or
 * withdraw their choice. On a page where the ad tag has not loaded there is no message
 * to open, so it goes to the advertising section of the privacy policy instead.
 */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-block py-2 text-start text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => {
        const w = window as unknown as { googlefc?: GoogleFc };
        if (typeof w.googlefc?.showRevocationMessage === 'function') {
          w.googlefc.showRevocationMessage();
          return;
        }
        window.location.href = '/legal/privacy#advertising';
      }}
    >
      {label}
    </button>
  );
}
