import { useState } from "react";
import { Button } from "@shared/ui/Button";
import { getLocale, setLocale, availableLocales } from "../../locales/locale";

export function LocaleSwitcher({ className }: { className?: string }) {
  const [locale, setLocaleState] = useState(getLocale());

  const toggleLocale = () => {
    const idx = availableLocales.indexOf(locale);
    const next = availableLocales[(idx + 1) % availableLocales.length];
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <Button type="button" variant="outline" onClick={toggleLocale} className={className}>
      {locale.toUpperCase()}
    </Button>
  );
}

export default LocaleSwitcher;
