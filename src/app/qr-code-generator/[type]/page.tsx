import { TypePage, typePageMeta } from '@/views/type-page';

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props) {
  return typePageMeta('en', (await params).type);
}

export default async function Page({ params }: Props) {
  return <TypePage locale="en" slug={(await params).type} />;
}
