import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string) => getTranslation(language, key),
    language,
  };
}
