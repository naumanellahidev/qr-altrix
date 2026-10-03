import { cn } from '@/lib/utils';

/** Google's four-colour mark, drawn as paths so no external asset is needed. */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4', className)} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 01-2.39 3.62v3h3.86c2.26-2.08 3.6-5.15 3.6-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.86-3a7.2 7.2 0 01-10.73-3.78H1.36v3.1A12 12 0 0012 24z"
      />
      <path fill="#FBBC05" d="M5.36 14.3a7.2 7.2 0 010-4.6V6.6H1.36a12 12 0 000 10.8l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 001.36 6.6l4 3.1A7.2 7.2 0 0112 4.75z"
      />
    </svg>
  );
}
