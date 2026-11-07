import { SeoDocPage, seoDocMeta } from '@/views/seo-pages';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return seoDocMeta('answers', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <SeoDocPage kind="answers" slug={(await params).slug} />;
}
