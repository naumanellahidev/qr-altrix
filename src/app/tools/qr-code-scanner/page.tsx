import { ScannerPage, scannerPageMeta } from '@/views/content-pages';

export function generateMetadata() {
  return scannerPageMeta('en');
}

export default function Page() {
  return <ScannerPage locale="en" />;
}
