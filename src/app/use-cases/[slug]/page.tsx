import { UseCasePage, useCasePageMeta } from '@/views/content-pages';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return useCasePageMeta('en', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <UseCasePage locale="en" slug={(await params).slug} />;
}
