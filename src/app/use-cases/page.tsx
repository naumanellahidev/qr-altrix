import { UseCasesHub, useCasesHubMeta } from '@/views/content-pages';

export function generateMetadata() {
  return useCasesHubMeta('en');
}

export default function Page() {
  return <UseCasesHub locale="en" />;
}
