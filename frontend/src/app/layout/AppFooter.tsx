import { UnderlineLink } from "@shared/ui/UnderlineLink";

export function AppFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="app-container flex flex-col items-center gap-3 py-4 text-center text-[11px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="bg-kleff-primary h-5 w-5 rounded-lg" />
          <div className="flex flex-col">
            <span className="text-foreground text-xs font-semibold">Kleff Platform</span>
            <span className="hidden text-[10px] text-neutral-500 sm:inline">
              Open-source-first hosting for modern teams.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:justify-end">
          <UnderlineLink to="/docs" className="text-neutral-500 hover:text-neutral-200">
            Docs
          </UnderlineLink>

          <UnderlineLink to="/status" className="text-neutral-500 hover:text-neutral-200">
            Status
          </UnderlineLink>

          <UnderlineLink to="/pricing" className="text-neutral-500 hover:text-neutral-200">
            Pricing
          </UnderlineLink>

          <span className="hidden text-neutral-600 sm:inline">•</span>

          <UnderlineLink to="/about" className="text-neutral-500 hover:text-neutral-200">
            About
          </UnderlineLink>

          <UnderlineLink to="/faq" className="text-neutral-500 hover:text-neutral-200">
            FAQ
          </UnderlineLink>

          <UnderlineLink to="/terms" className="text-neutral-500 hover:text-neutral-200">
            Terms
          </UnderlineLink>

          <UnderlineLink to="/privacy" className="text-neutral-500 hover:text-neutral-200">
            Privacy
          </UnderlineLink>

          <span className="text-neutral-600">&copy; {new Date().getFullYear()} Kleff</span>
        </div>
      </div>
    </footer>
  );
}
