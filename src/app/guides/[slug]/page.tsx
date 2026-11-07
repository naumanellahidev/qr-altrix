import { GuidePage, guidePageMeta } from '@/views/content-pages';
import { SeoDocPage, seoDocMeta } from '@/views/seo-pages';
import { findSeoDoc } from '@/content/seo';
import { GUIDES } from '@/content/registry';

type Props = { params: Promise<{ slug: string }> };

// The translated guides come first; the longer English-only guides share the /guides/ URL space.
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return GUIDES.some((g) => g.slug === slug) || !findSeoDoc('guides', slug) ? guidePageMeta('en', slug) : seoDocMeta('guides', slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return GUIDES.some((g) => g.slug === slug) || !findSeoDoc('guides', slug) ? <GuidePage locale="en" slug={slug} /> : <SeoDocPage kind="guides" slug={slug} />;
}
