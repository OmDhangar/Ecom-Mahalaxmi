import { useTranslation } from 'react-i18next';
import translationService from '@/services/translationService';

/**
 * Custom hook for translating dynamic content (from database)
 * Usage: const translateDynamic = useDynamicTranslation();
 * Then: translateDynamic(content, contentType)
 */
export const useDynamicTranslation = () => {
  const { i18n } = useTranslation();

  const translateDynamic = (content, contentType = 'general') => {
    if (!content) return content;
    
    const currentLanguage = i18n.language;
    return translationService.translateDynamicContent(
      content, 
      currentLanguage, 
      contentType
    );
  };

  // Specific translation methods for convenience
  const translateProduct = {
    title: (title) => translateDynamic(title, 'product_title'),
    description: (description) => translateDynamic(description, 'description'),
    category: (category) => translateDynamic(category, 'category'),
    brand: (brand) => translateDynamic(brand, 'brand'),
  };

  const translateCarousel = {
    title: (title) => translateDynamic(title, 'carousel_title'),
    subtitle: (subtitle) => translateDynamic(subtitle, 'carousel_subtitle'),
    cta: (cta) => translateDynamic(cta, 'carousel_cta'),
  };

  return {
    translateDynamic,
    translateProduct,
    translateCarousel,
    currentLanguage: i18n.language
  };
};

export default useDynamicTranslation;
