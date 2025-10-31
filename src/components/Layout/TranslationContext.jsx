import React, { createContext, useContext, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadTranslations } from "@/redux/reducers/translationSlice";

// Create a context for translations
const TranslationContext = createContext((key) => key);

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Translation provider component
export const TranslationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const translations = useSelector((state) => state.translation.translations);
  const currentLanguage = useSelector((state) => state.translation.currentLanguage);
  const prevLangRef = useRef(currentLanguage.langCode);

  // Function to load translations
  const loadCurrentTranslations = () => {
    dispatch(loadTranslations(currentLanguage.langCode));
  };

  // Initial load and handle page visibility
  useEffect(() => {
    loadCurrentTranslations();

    // Reload translations when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCurrentTranslations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle language changes
  useEffect(() => {
    if (prevLangRef.current !== currentLanguage.langCode) {
      loadCurrentTranslations();
      prevLangRef.current = currentLanguage.langCode;
    }
  }, [currentLanguage.langCode]);

  // Translation function with fallback
  const translate = (label) => {
    if (!translations || Object.keys(translations).length === 0) {
      return label;
    }
    return translations[label] || label;
  };

  return (
    <TranslationContext.Provider value={translate}>
      {children}
    </TranslationContext.Provider>
  );
};