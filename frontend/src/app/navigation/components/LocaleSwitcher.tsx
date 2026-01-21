import { useState, useRef, useEffect } from "react";
import { getLocale, setLocale, availableLocales, type Locale } from "@app/locales/locale";
import { Globe, ChevronDown, Check } from "lucide-react";

const localeConfig: Record<Locale, { flag: string; label: string; shortLabel: string }> = {
  en: {
    flag: "🇺🇸",
    label: "English",
    shortLabel: "EN"
  },
  fr: {
    flag: "🇫🇷",
    label: "Français",
    shortLabel: "FR"
  }
};

interface LocaleSwitcherProps {
  className?: string;
  variant?: "compact" | "sidebar" | "mobile";
}

export function LocaleSwitcher({ className = "", variant = "compact" }: LocaleSwitcherProps) {
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

  const currentConfig = localeConfig[locale];

  // Mobile variant (flag + language code, like compact but slightly different styling)
  if (variant === "mobile") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
          aria-label="Change language"
        >
          <span className="text-base">{currentConfig.flag}</span>
          <span>{currentConfig.shortLabel}</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-60" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 z-70 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#18181a]/98 shadow-xl backdrop-blur-sm">
              {availableLocales.map((loc) => {
                const config = localeConfig[loc];
                const isActive = loc === locale;

                return (
                  <button
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{config.flag}</span>
                      <span className="font-medium">{config.label}</span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-[#FFD56A]" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Sidebar variant (full width, dropdown appears above)
  if (variant === "sidebar") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{currentConfig.flag}</span>
            <span>{currentConfig.label}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full left-0 z-50 mb-2 overflow-hidden rounded-lg border border-white/10 bg-[#18181a]/98 shadow-lg backdrop-blur-sm">
            {availableLocales.map((loc) => {
              const config = localeConfig[loc];
              const isActive = loc === locale;

              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.flag}</span>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-[#FFD56A]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Compact variant (default - for desktop header)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
      >
        <span className="text-base">{currentConfig.flag}</span>
        <span className="hidden sm:inline">{currentConfig.shortLabel}</span>
        <Globe className="h-3.5 w-3.5 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-100" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-110 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#18181a]/98 shadow-xl backdrop-blur-sm">
            {availableLocales.map((loc) => {
              const config = localeConfig[loc];
              const isActive = loc === locale;

              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.flag}</span>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-[#FFD56A]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default LocaleSwitcher;
