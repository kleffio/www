export const availableLocales = ["en", "fr"] as const;
export type Locale = typeof availableLocales[number];

let currentLocale: Locale = "en";

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  if (!availableLocales.includes(locale)) return;
  currentLocale = locale;
}

export default {
  getLocale,
  setLocale,
  availableLocales
};
