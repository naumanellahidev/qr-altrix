import { TypePage, typePageMeta } from '@/views/type-page';
import { localeFromParams, validLocale } from '@/views/locale-param';

type Props = { params: Promise<{ locale: string; type: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, type } = await params;
  const valid = validLocale(locale);
  return valid ? typePageMeta(valid, type) : {};
}

export default async function Page({ params }: Props) {
  const locale = await localeFromParams(params);
  return <TypePage locale={locale} slug={(await params).type} />;
}
