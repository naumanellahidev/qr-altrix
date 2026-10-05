import { HomePage, homePageMeta } from '@/views/home-page';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return homePageMeta('en');
}

export default function Page() {
  return <HomePage locale="en" />;
}
