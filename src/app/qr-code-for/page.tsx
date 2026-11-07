import { SeoHub, seoHubMeta } from '@/views/seo-pages';

export function generateMetadata() {
  return seoHubMeta('for');
}

export default function Page() {
  return <SeoHub kind="for" />;
}
