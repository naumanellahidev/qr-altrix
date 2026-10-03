import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The QR ALTRIX mark. Drawn from scratch: a rounded tile holding an abstract QR
 * fragment — three finder squares and a data cluster — on the brand gradient.
 */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="QR ALTRIX"
    >
      <defs>
        <linearGradient id="qa-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#qa-brand)" />
      <g fill="#fff">
        {/* three finder patterns */}
        <path
          fillRule="evenodd"
          d="M10 10h11v11H10V10zm3 3v5h5v-5h-5zm14-3h11v11H27V10zm3 3v5h5v-5h-5zM10 27h11v11H10V27zm3 3v5h5v-5h-5z"
        />
        {/* data cluster forming an implied "A" diagonal */}
        <path d="M25 25h3.2v3.2H25V25zm5 2.4h3.2v3.2H30v-3.2zm-2.6 5h3.2v3.2h-3.2v-3.2zm5.2 0H36v3.2h-3.2v-3.2zm2.6-5.2H38v3.2h-2.6v-3.2z" />
      </g>
    </svg>
  );
}

export function BrandLogo({
  className,
  href = '/',
  compact = false,
  size = 30,
}: {
  className?: string;
  href?: string | null;
  compact?: boolean;
  size?: number;
}) {
  const content = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      {compact ? null : (
        <span className="font-display text-[15px] font-bold leading-none tracking-[-0.02em]">
          QR <span className="text-gradient">ALTRIX</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
