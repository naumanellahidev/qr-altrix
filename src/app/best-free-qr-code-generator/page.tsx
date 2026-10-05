import { ComparePage, comparePageMeta } from '@/views/content-pages';

export function generateMetadata() {
  return comparePageMeta('en');
}

export default function Page() {
  return <ComparePage locale="en" />;
}
