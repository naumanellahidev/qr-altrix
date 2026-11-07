import { GuidesHub, guidesHubMeta } from '@/views/content-pages';
import { SeoDocGroups } from '@/views/seo-pages';

export function generateMetadata() {
  return guidesHubMeta('en');
}

export default function Page() {
  return (
    <GuidesHub locale="en">
      <div className="mt-12">
        <SeoDocGroups kind="guides" />
      </div>
    </GuidesHub>
  );
}
