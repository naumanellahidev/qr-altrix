import { SeoHub, seoHubMeta } from '@/views/seo-pages';

export function generateMetadata() {
  return seoHubMeta('answers');
}

export default function Page() {
  return <SeoHub kind="answers" />;
}
