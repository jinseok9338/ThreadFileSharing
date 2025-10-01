import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEn from "./translation.en.json";
import translationKo from "./translation.ko.json";

export const I18N_LANG = "i18nextLng";
export const I18N_LANG_EN = "en"; // en-US
export const I18N_LANG_KO = "ko"; // ko-KR

const resources = {
  en: {
    translation: translationEn,
  },
  ko: {
    translation: translationKo,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "ko",
    interpolation: { escapeValue: true },
    returnObjects: true,
    returnEmptyString: true,
    returnNull: true,
  });

export const currentLanguage = () => i18n.language.split("-")[0];

export default i18n;
