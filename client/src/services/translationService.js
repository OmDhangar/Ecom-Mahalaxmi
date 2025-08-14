// Translation service for dynamic content
class TranslationService {
  constructor() {
    // Cache for translated content to avoid repeated API calls
    this.translationCache = new Map();
    
    // Product name translations (manually curated for better accuracy)
    this.productTranslations = {
      // English -> Hindi -> Marathi
      "iPhone 15 Pro": {
        hi: "आईफोन 15 प्रो",
        mr: "आयफोन 15 प्रो"
      },
      "Samsung Galaxy S24": {
        hi: "सैमसंग गैलेक्सी S24",
        mr: "सॅमसंग गॅलेक्सी S24"
      },
      "OnePlus 12": {
        hi: "वनप्लस 12",
        mr: "वनप्लस 12"
      },
      "Nike Air Force 1": {
        hi: "नाइके एयर फोर्स 1",
        mr: "नाईक एअर फोर्स 1"
      },
      "Adidas Ultraboost": {
        hi: "एडिडास अल्ट्राबूस्ट",
        mr: "अॅडिडास अल्ट्राबूस्ट"
      },
      "LEGO Building Blocks": {
        hi: "लेगो बिल्डिंग ब्लॉक्स",
        mr: "लेगो बिल्डिंग ब्लॉक्स"
      },
      // Add more product translations as needed
    };

    // Category translations
    this.categoryTranslations = {
      "electronics": {
        hi: "इलेक्ट्रॉनिक्स",
        mr: "इलेक्ट्रॉनिक्स"
      },
      "fashion": {
        hi: "फैशन",
        mr: "फॅशन"
      },
      "toys": {
        hi: "खिलौने",
        mr: "खेळणी"
      },
      "farming": {
        hi: "खेती",
        mr: "शेती"
      },
      "mobile": {
        hi: "मोबाइल",
        mr: "मोबाईल"
      },
      "smartphone": {
        hi: "स्मार्टफोन",
        mr: "स्मार्टफोन"
      }
    };

    // Brand translations
    this.brandTranslations = {
      "Apple": {
        hi: "एप्पल",
        mr: "अॅपल"
      },
      "Samsung": {
        hi: "सैमसंग",
        mr: "सॅमसंग"
      },
      "OnePlus": {
        hi: "वनप्लस",
        mr: "वनप्लस"
      },
      "Nike": {
        hi: "नाइके",
        mr: "नाईक"
      },
      "Adidas": {
        hi: "एडिडास",
        mr: "अॅडिडास"
      },
      "LEGO": {
        hi: "लेगो",
        mr: "लेगो"
      }
    };

    // Common words/phrases for description translation
    this.commonPhrases = {
      "Latest model": {
        hi: "नवीनतम मॉडल",
        mr: "नवीनतम मॉडेल"
      },
      "High quality": {
        hi: "उच्च गुणवत्ता",
        mr: "उच्च गुणवत्ता"
      },
      "Brand new": {
        hi: "बिल्कुल नया",
        mr: "अगदी नवीन"
      },
      "Original product": {
        hi: "मूल उत्पाद",
        mr: "मूळ उत्पादन"
      },
      "Best price": {
        hi: "बेहतरीन कीमत",
        mr: "उत्तम किंमत"
      },
      "Fast delivery": {
        hi: "तेज़ डिलीवरी",
        mr: "जलद डिलिव्हरी"
      },
      "Free shipping": {
        hi: "मुफ्त शिपिंग",
        mr: "मोफत शिपिंग"
      },
      "1 year warranty": {
        hi: "1 साल की वारंटी",
        mr: "1 वर्ष वॉरंटी"
      },
      "Genuine warranty": {
        hi: "असली वारंटी",
        mr: "अस्सल वॉरंटी"
      },
      "Cash on delivery": {
        hi: "कैश ऑन डिलीवरी",
        mr: "कॅश ऑन डिलिव्हरी"
      }
    };
  }

  // Main translation method
  translateDynamicContent(content, targetLanguage, contentType = 'general') {
    // If target language is English, return original content
    if (targetLanguage === 'en' || !targetLanguage) {
      return content;
    }

    // Check cache first
    const cacheKey = `${content}_${targetLanguage}_${contentType}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    let translatedContent = content;

    try {
      switch (contentType) {
        case 'product_title':
          translatedContent = this.translateProductTitle(content, targetLanguage);
          break;
        case 'category':
          translatedContent = this.translateCategory(content, targetLanguage);
          break;
        case 'brand':
          translatedContent = this.translateBrand(content, targetLanguage);
          break;
        case 'description':
          translatedContent = this.translateDescription(content, targetLanguage);
          break;
        case 'carousel_title':
          translatedContent = this.translateCarouselContent(content, targetLanguage, 'title');
          break;
        case 'carousel_subtitle':
          translatedContent = this.translateCarouselContent(content, targetLanguage, 'subtitle');
          break;
        case 'carousel_cta':
          translatedContent = this.translateCarouselContent(content, targetLanguage, 'cta');
          break;
        default:
          translatedContent = this.translateGeneral(content, targetLanguage);
      }

      // Cache the result
      this.translationCache.set(cacheKey, translatedContent);
      
    } catch (error) {
      console.warn(`Translation failed for: ${content}`, error);
      translatedContent = content; // Fallback to original
    }

    return translatedContent;
  }

  // Specific translation methods
  translateProductTitle(title, targetLanguage) {
    const translation = this.productTranslations[title];
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }

    // Fallback: Try to translate individual words
    return this.translateByWords(title, targetLanguage);
  }

  translateCategory(category, targetLanguage) {
    const translation = this.categoryTranslations[category.toLowerCase()];
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }
    return category;
  }

  translateBrand(brand, targetLanguage) {
    const translation = this.brandTranslations[brand];
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }
    return brand;
  }

  translateDescription(description, targetLanguage) {
    let translatedDesc = description;
    
    // Replace common phrases
    Object.entries(this.commonPhrases).forEach(([english, translations]) => {
      if (translations[targetLanguage]) {
        const regex = new RegExp(english, 'gi');
        translatedDesc = translatedDesc.replace(regex, translations[targetLanguage]);
      }
    });

    // Replace brand names
    Object.entries(this.brandTranslations).forEach(([english, translations]) => {
      if (translations[targetLanguage]) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedDesc = translatedDesc.replace(regex, translations[targetLanguage]);
      }
    });

    return translatedDesc;
  }

  translateCarouselContent(content, targetLanguage, type) {
    // Carousel-specific translations
    const carouselTranslations = {
      // Titles
      "Exclusive Mobile Deals": {
        hi: "विशेष मोबाइल ऑफ़र",
        mr: "विशेष मोबाईल ऑफर्स"
      },
      "Trendy Fashion Collection": {
        hi: "ट्रेंडी फैशन कलेक्शन",
        mr: "ट्रेंडी फॅशन कलेक्शन"
      },
      "Toys for Every Child": {
        hi: "हर बच्चे के लिए खिलौने",
        mr: "प्रत्येक मुलासाठी खेळणी"
      },
      "Farming Essentials": {
        hi: "खेती की आवश्यक वस्तुएं",
        mr: "शेती आवश्यक वस्तू"
      },
      
      // Subtitles
      "Grab the latest smartphones with up to 40% off": {
        hi: "नवीनतम स्मार्टफोन पर 40% तक की छूट पाएं",
        mr: "नवीनतम स्मार्टफोनवर ४०% पर्यंत सूट मिळवा"
      },
      "New arrivals in fashion with unbeatable prices": {
        hi: "बेजोड़ कीमतों पर फैशन में नई आगमन",
        mr: "अप्रतिम किमतींमध्ये फॅशनचे नवे आगमन"
      },
      "Educational and fun toys starting at just ₹199": {
        hi: "शैक्षणिक और मज़ेदार खिलौने ₹199 से शुरू",
        mr: "शैक्षणिक आणि मजेदार खेळणी फक्त ₹१९९ पासून"
      },
      "Get farming tools and seeds at wholesale prices": {
        hi: "थोक कीमतों पर खेती उपकरण और बीज प्राप्त करें",
        mr: "थोक किमतींमध्ये शेती साधने व बियाणे घ्या"
      },
      
      // CTAs
      "Shop Mobiles": {
        hi: "मोबाइल खरीदें",
        mr: "मोबाईल खरेदी करा"
      },
      "Shop Fashion": {
        hi: "फैशन खरीदें",
        mr: "फॅशन खरेदी करा"
      },
      "Shop Toys": {
        hi: "खिलौने खरीदें",
        mr: "खेळणी खरेदी करा"
      },
      "Shop Farming": {
        hi: "खेती खरीदें",
        mr: "शेती खरेदी करा"
      }
    };

    const translation = carouselTranslations[content];
    if (translation && translation[targetLanguage]) {
      return translation[targetLanguage];
    }

    return this.translateGeneral(content, targetLanguage);
  }

  translateByWords(text, targetLanguage) {
    let translatedText = text;
    
    // Replace known brands first
    Object.entries(this.brandTranslations).forEach(([english, translations]) => {
      if (translations[targetLanguage]) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translations[targetLanguage]);
      }
    });

    // Replace known categories
    Object.entries(this.categoryTranslations).forEach(([english, translations]) => {
      if (translations[targetLanguage]) {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translations[targetLanguage]);
      }
    });

    return translatedText;
  }

  translateGeneral(content, targetLanguage) {
    // Apply all available translations
    let translatedContent = content;
    
    // Common phrases
    Object.entries(this.commonPhrases).forEach(([english, translations]) => {
      if (translations[targetLanguage]) {
        const regex = new RegExp(english, 'gi');
        translatedContent = translatedContent.replace(regex, translations[targetLanguage]);
      }
    });

    return translatedContent;
  }

  // Method to add new translations dynamically
  addProductTranslation(english, hindi, marathi) {
    this.productTranslations[english] = {
      hi: hindi,
      mr: marathi
    };
  }

  addBrandTranslation(english, hindi, marathi) {
    this.brandTranslations[english] = {
      hi: hindi,
      mr: marathi
    };
  }

  addPhraseTranslation(english, hindi, marathi) {
    this.commonPhrases[english] = {
      hi: hindi,
      mr: marathi
    };
  }

  // Clear cache method
  clearCache() {
    this.translationCache.clear();
  }
}

// Create singleton instance
const translationService = new TranslationService();
export default translationService;
