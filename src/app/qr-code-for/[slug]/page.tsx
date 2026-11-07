import { SeoDocPage, seoDocMeta } from '@/views/seo-pages';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return seoDocMeta('for', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <SeoDocPage kind="for" slug={(await params).slug} />;
}
