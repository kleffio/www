import { ROUTES } from "@app/routes/routes";
import { UnderlineLink } from "@shared/ui/UnderlineLink";

export function AppFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="app-container py-8">
        <div className="flex flex-wrap items-start gap-x-12 gap-y-8 justify-between">
          {/* Brand Section */}
          <div className="flex items-start gap-2 min-w-[200px]">
            <span className="bg-kleff-primary h-4 w-5 rounded-lg flex-shrink-0 mt-1" />
            <div className="flex flex-col">
              <span className="text-foreground text-[17px] font-semibold">
                Kleff Platform
              </span>
              <span className="text-[15px] text-neutral-500 mt-1 max-w-xs">
                Open-source-first hosting for modern teams.
              </span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            {/* Product Column */}
            <div className="min-w-[120px]">
              <h3 className="text-[15px] font-semibold text-neutral-200 mb-3">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <UnderlineLink
                    to={ROUTES.DOCS}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Docs
                  </UnderlineLink>
                </li>
                <li>
                  <UnderlineLink
                    to={ROUTES.PRICING}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Pricing
                  </UnderlineLink>
                </li>
                <li>
                  <UnderlineLink
                    to={ROUTES.STATUS}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Status
                  </UnderlineLink>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="min-w-[120px]">
              <h3 className="text-[15px] font-semibold text-neutral-200 mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <UnderlineLink
                    to={ROUTES.ABOUT}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    About
                  </UnderlineLink>
                </li>
                <li>
                  <UnderlineLink
                    to={ROUTES.FAQ}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    FAQ
                  </UnderlineLink>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="min-w-[120px]">
              <h3 className="text-[15px] font-semibold text-neutral-200 mb-3">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <UnderlineLink
                    to={ROUTES.TERMS}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Terms
                  </UnderlineLink>
                </li>
                <li>
                  <UnderlineLink
                    to={ROUTES.PRIVACY}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Privacy
                  </UnderlineLink>
                </li>
              </ul>
            </div>

             {/* Contact Us Column */}
                  <div>
              <h3 className="text-[15px] font-semibold text-neutral-200 mb-3">
                Contact Us
              </h3>
              <ul className="space-y-2">
                <li>
                  <UnderlineLink
                    to={"https://www.linkedin.com/company/kleffio/"}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                    Linkedin
                  </UnderlineLink>
                </li>
                <li>
                  <UnderlineLink
                    to={"mailto:kleffioapp@gmail.com"}
                    className="text-[14px] text-neutral-500 hover:text-neutral-200"
                  >
                      Email
                  </UnderlineLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[14px] text-neutral-600">
          &copy; {new Date().getFullYear()} Kleff. All rights reserved.
        </div>
      </div>
    </footer>
  );
}