import { TypesHub, typesHubMeta } from '@/views/content-pages';

export function generateMetadata() {
  return typesHubMeta('en');
}

export default function Page() {
  return <TypesHub locale="en" />;
}
