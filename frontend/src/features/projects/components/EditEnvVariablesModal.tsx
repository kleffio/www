import { useState, useEffect, type FormEvent } from "react";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";
import { X, Plus, Trash2, Save } from "lucide-react";
import type { Container } from "@features/projects/types/Container";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

interface EditEnvVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container | null;
  onSave?: (containerId: string, envVariables: Record<string, string>) => Promise<void>;
}

export function EditEnvVariablesModal({
  isOpen,
  onClose,
  container,
  onSave
}: EditEnvVariablesModalProps) {
  console.log("EditEnvVariablesModal render - isOpen:", isOpen, "container:", container?.name);
  const [envVariables, setEnvVariables] = useState<Array<{ key: string; value: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState(getLocale());
  const t = translations[locale].editEnvModal;

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocale(currentLocale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [locale]);

  useEffect(() => {
    if (container && isOpen) {
      // Convert the container's envVariables object to array format
      if (container.envVariables) {
        const envArray = Object.entries(container.envVariables).map(([key, value]) => ({
          key,
          value
        }));
        setEnvVariables(envArray);
      } else {
        setEnvVariables([]);
      }
      setError(null);
    }
  }, [container, isOpen]);

  if (!isOpen || !container) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert env variables array to object, filtering out empty keys
      const envVarsObject = envVariables.reduce(
        (acc, { key, value }) => {
          if (key.trim()) {
            acc[key.trim()] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      if (onSave) {
        await onSave(container.containerId, envVarsObject);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(t.failed_update);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVariable = () => {
    setEnvVariables([...envVariables, { key: "", value: "" }]);
  };

  const handleRemoveVariable = (index: number) => {
    const updated = envVariables.filter((_, i) => i !== index);
    setEnvVariables(updated);
  };

  const handleUpdateKey = (index: number, newKey: string) => {
    const updated = [...envVariables];
    updated[index].key = newKey;
    setEnvVariables(updated);
  };

  const handleUpdateValue = (index: number, newValue: string) => {
    const updated = [...envVariables];
    updated[index].value = newValue;
    setEnvVariables(updated);
  };

  const inputBase =
    "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 " +
    "transition-colors hover:border-white/20 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30";

  return (
    <section className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <section className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col px-4 sm:px-0">
        <SoftPanel className="flex max-h-full flex-col border border-white/10 bg-black/70 shadow-2xl shadow-black/60">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-50">{t.title}</h2>
              <p className="mt-1 text-xs text-neutral-400">
                {t.subtitle} <span className="font-mono text-neutral-300">{container.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 transition-colors hover:text-neutral-50"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {/* Environment Variables Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium tracking-wide text-neutral-300 uppercase">
                    {t.environment_variables}
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleAddVariable}
                    className="rounded-full px-3 py-1.5 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {t.add_variable}
                  </Button>
                </div>

                {envVariables.length === 0 && (
                  <div className="rounded-lg border border-white/5 bg-white/5 p-6 text-center">
                    <p className="text-sm text-neutral-400">{t.no_env_vars}</p>
                    <p className="mt-1 text-xs text-neutral-500">{t.no_env_vars_hint}</p>
                  </div>
                )}

                {envVariables.map((envVar, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-white/5 bg-white/5 p-3 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      type="text"
                      placeholder={t.key}
                      value={envVar.key}
                      onChange={(e) => handleUpdateKey(index, e.target.value)}
                      className={inputBase}
                    />
                    <input
                      type="text"
                      placeholder={t.value}
                      value={envVar.value}
                      onChange={(e) => handleUpdateValue(index, e.target.value)}
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                      aria-label="Delete variable"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full px-4 py-2 text-sm"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-gradient-kleff rounded-full px-5 py-2 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>{t.saving}</>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    {t.save_button}
                  </>
                )}
              </Button>
            </div>
          </form>
        </SoftPanel>
      </section>
    </section>
  );
}
