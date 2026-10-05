import { GuidePage, guidePageMeta } from '@/views/content-pages';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return guidePageMeta('en', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuidePage locale="en" slug={(await params).slug} />;
}
