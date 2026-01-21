import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { Section } from '@shared/ui/Section';
import { Badge } from '@shared/ui/Badge';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { viewPricesApi, type Price } from '@features/billing/api/viewPrices';
import enTranslations from '@app/locales/en/legal.json';
import frTranslations from '@app/locales/fr/legal.json';
import { getLocale } from '@app/locales/locale';

const translations = {
  en: enTranslations,
  fr: frTranslations
};

interface PricingItem {
  metric: string;
  description: string;
  price: number;
}

const PricingPage: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocaleState] = useState(getLocale());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [locale]);

  const t = translations[locale].pricing;

  // Fetch prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const fetchedPrices = await viewPricesApi.getPrices();
        setPrices(fetchedPrices);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError('Failed to load pricing information');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Build pricing items from fetched prices
  const pricingItems: PricingItem[] = useMemo(() => {
    if (prices.length === 0) {
      return [];
    }

    return [
      {
        metric: t.metrics.cpu.label,
        description: t.metrics.cpu.description,
        price: prices.find((p) => p.metric === 'CPU_HOURS')?.price || 0,
      },
      {
        metric: t.metrics.ram.label,
        description: t.metrics.ram.description,
        price: prices.find((p) => p.metric === 'MEMORY_GB_HOURS')?.price || 0,
      },
      {
        metric: t.metrics.storage.label,
        description: t.metrics.storage.description,
        price: prices.find((p) => p.metric === 'STORAGE_GB')?.price || 0,
      },
    ];
  }, [prices, locale, t]);

  const filteredItems = pricingItems;

  if (loading) {
    return (
      <div className="relative isolate overflow-hidden">
        <Section className="flex flex-col items-center justify-center gap-8 px-4 pt-16 pb-12 min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kleff-primary mx-auto mb-4"></div>
            <p className="text-neutral-300">{t.loading}</p>
          </div>
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative isolate overflow-hidden">
        <Section className="flex flex-col items-center justify-center gap-8 px-4 pt-16 pb-12 min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-kleff inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110"
            >
              {t.error_retry}
            </button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-8 px-4 pt-16 pb-12 text-center sm:gap-12 sm:pt-20 sm:pb-16">
        <div className="w-full max-w-3xl space-y-6">
          <Badge
            variant="gradient"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>{t.badge}</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
              {t.title_line1}
              <br />
              <span className="text-gradient-kleff">{t.title_line2}</span>
            </h1>
            <p className="text-xs text-neutral-300 sm:text-sm">
              {t.subtitle}
            </p>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          {filteredItems.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{t.no_results.title}</h3>
              <p className="mb-6 text-sm text-neutral-400">
                {t.no_results.description}
              </p>
            </div>
          ) : (
            <div className="glass-panel p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-lg border border-white/10 bg-black/40 p-4 transition-all hover:bg-black/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xs font-semibold text-neutral-50 sm:text-sm">
                          {item.metric}
                        </h3>
                        <p className="text-[10px] text-neutral-400 sm:text-xs mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="bg-gradient-kleff flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black sm:h-6 sm:w-6 sm:text-[11px]">
                        {idx + 1}
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-kleff-primary">
                      ${item.price.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <SoftPanel className="p-6 sm:p-8">
            <h2 className="mb-3 text-xl font-semibold text-white sm:text-2xl">
              {t.custom_plan.title}
            </h2>
            <p className="mb-4 text-[11px] text-neutral-300 sm:mb-6 sm:text-xs">
              {t.custom_plan.description}
            </p>
            <a
              href="mailto:sales@kleff.ca"
              className="bg-gradient-kleff inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110 sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t.custom_plan.button}
            </a>
          </SoftPanel>
        </div>
      </Section>
    </div>
  );
};

export default PricingPage;
