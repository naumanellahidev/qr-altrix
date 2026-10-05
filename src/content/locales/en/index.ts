import type { CatalogCopy, LocaleContent, TypeKey } from '@/content/schema';
import { QR_TYPES } from '@/lib/qr/catalog';
import { types } from './types';
import { useCases } from './use-cases';
import { guides } from './guides';
import { compare, tools, ui } from './misc';
import { home } from './home';
import { generator } from './generator';

// English names and taglines come straight from the catalogue the app runs on.
const catalog = Object.fromEntries(QR_TYPES.map((type) => [type.type, { label: type.label, tagline: type.tagline }])) as CatalogCopy;

const en: LocaleContent = { ui, home, catalog, generator, phrases: {}, types, useCases, guides, compare, tools };
export default en;

export type { TypeKey };
