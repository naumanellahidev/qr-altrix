import type { LocaleContent } from '@/content/schema';
import { catalogFromPhrases } from '@/content/phrase-tools';
import { compare, tools, ui } from './misc';
import { home } from './home';
import { generator } from './generator';
import { phrases } from './phrases';
import { types } from './types';
import { useCases } from './use-cases';
import { guides } from './guides';

const pt: LocaleContent = {
  ui,
  home,
  catalog: catalogFromPhrases(phrases),
  generator,
  phrases,
  types,
  useCases,
  guides,
  compare,
  tools,
};
export default pt;
