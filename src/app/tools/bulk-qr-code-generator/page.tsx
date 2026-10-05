import { BulkToolPage, bulkPageMeta } from '@/views/content-pages';

export function generateMetadata() {
  return bulkPageMeta('en');
}

export default function Page() {
  return <BulkToolPage locale="en" />;
}
