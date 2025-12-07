import { useState, useRef, useEffect } from "react";
import { Button } from "@shared/ui/Button";
import { getLocale, setLocale, availableLocales, type Locale } from "../../app/locales/locale";
import { Globe, ChevronDown } from "lucide-react";

const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français"
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const [locale, setLocaleState] = useState(getLocale());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${className || ""}`}
      >
        <Globe size={16} />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[150px] rounded-lg border border-white/20 bg-neutral-900/95 backdrop-blur-sm shadow-lg z-50">
          <div className="py-1">
            {availableLocales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                  locale === loc
                    ? "bg-white/5 text-neutral-50 font-medium"
                    : "text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{localeNames[loc]}</span>
                  <span className="text-xs text-neutral-500">{loc.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocaleSwitcher;