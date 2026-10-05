import { HomePage, homePageMeta } from '@/views/home-page';
import { localeFromParams, validLocale } from '@/views/locale-param';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const valid = validLocale((await params).locale);
  return valid ? homePageMeta(valid) : {};
}

export default async function Page({ params }: Props) {
  return <HomePage locale={await localeFromParams(params)} />;
}
