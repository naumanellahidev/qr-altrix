import { TypesHub, typesHubMeta } from '@/views/content-pages';
import { localeFromParams, validLocale } from '@/views/locale-param';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const valid = validLocale((await params).locale);
  return valid ? typesHubMeta(valid) : {};
}

export default async function Page({ params }: Props) {
  return <TypesHub locale={await localeFromParams(params)} />;
}
