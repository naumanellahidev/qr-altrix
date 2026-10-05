import { UseCasePage, useCasePageMeta } from '@/views/content-pages';
import { localeFromParams, validLocale } from '@/views/locale-param';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const valid = validLocale(locale);
  return valid ? useCasePageMeta(valid, slug) : {};
}

export default async function Page({ params }: Props) {
  const locale = await localeFromParams(params);
  return <UseCasePage locale={locale} slug={(await params).slug} />;
}
