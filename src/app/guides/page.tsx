import { GuidesHub, guidesHubMeta } from '@/views/content-pages';

export function generateMetadata() {
  return guidesHubMeta('en');
}

export default function Page() {
  return <GuidesHub locale="en" />;
}
