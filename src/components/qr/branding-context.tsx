'use client';

import * as React from 'react';

/**
 * The platform's credit line, handed down from a server layout so every live preview
 * shows exactly what the downloaded file will carry. Null when the operator turned it off.
 */
const BrandingContext = React.createContext<string | null>(null);

export function BrandingProvider({ value, children }: { value: string | null; children: React.ReactNode }) {
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): string | null {
  return React.useContext(BrandingContext);
}
