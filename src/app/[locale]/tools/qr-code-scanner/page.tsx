import { ScannerPage, scannerPageMeta } from '@/views/content-pages';
import { localeFromParams, validLocale } from '@/views/locale-param';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const valid = validLocale((await params).locale);
  return valid ? scannerPageMeta(valid) : {};
}

export default async function Page({ params }: Props) {
  return <ScannerPage locale={await localeFromParams(params)} />;
}
