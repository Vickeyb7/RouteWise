import React from 'react';

interface FooterProps {
  onNavigate: (tab: 'plan' | 'compare' | 'my-trips' | 'profile') => void;
  onOpenMethodology?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenMethodology }) => {
  return (
    <footer className="w-full bg-surface-container-low mt-space-xl shadow-[0_-1px_8px_rgba(20,36,58,0.02)] border-t border-surface-container">
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-lg">
          {/* Brand Intro */}
          <div className="space-y-space-sm md:col-span-1">
            <div className="flex items-center gap-space-xs">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[16px]">alt_route</span>
              </div>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">RouteWise</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Mathematical routing and transparent transit expenditure intelligence. Know your trip cost before you go.
            </p>
          </div>

          {/* Intelligence Navigation */}
          <div className="space-y-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Intelligence
            </h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button
                  onClick={onOpenMethodology}
                  className="hover:text-primary transition-colors text-left"
                  type="button"
                >
                  Calculation Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('plan')}
                  className="hover:text-primary transition-colors text-left"
                  type="button"
                >
                  Statutory Data Sources & Feeds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compare')}
                  className="hover:text-primary transition-colors text-left"
                  type="button"
                >
                  Cost Benchmark Index
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-trips')}
                  className="hover:text-primary transition-colors text-left"
                  type="button"
                >
                  Scenario Comparison Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Regional & Currency */}
          <div className="space-y-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Regional & Currency
            </h4>
            <div className="flex flex-wrap gap-space-xs pt-1">
              <span className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold border border-surface-container-highest">
                ₹ INR (Primary)
              </span>
              <span className="px-2 py-1 rounded bg-surface text-secondary font-label-sm text-label-sm">
                $ USD (Preview)
              </span>
              <span className="px-2 py-1 rounded bg-surface text-secondary font-label-sm text-label-sm">
                € EUR (Preview)
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary pt-1">
              Fuel indexed daily across 28 states & union territories.
            </p>
          </div>

          {/* Developer Telemetry */}
          <div className="space-y-space-xs">
            <h4 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Developer Telemetry
            </h4>
            <div className="p-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant space-y-1">
              <div className="flex justify-between">
                <span>Engine:</span>
                <span className="text-primary font-semibold">v2.4.1-rc</span>
              </div>
              <div className="flex justify-between">
                <span>Toll Matrix Sync:</span>
                <span className="text-tertiary font-semibold">Active (NHAI)</span>
              </div>
              <div className="flex justify-between">
                <span>API Status:</span>
                <span className="text-primary font-semibold">Nominal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Compliance bottom line */}
        <div className="pt-space-md border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-secondary">
          <div>© 2025-2026 RouteWise Technologies. All mathematical models calibrated.</div>
          <div className="flex items-center gap-space-md">
            <span className="hover:text-on-surface cursor-pointer">Data Compliance</span>
            <span>•</span>
            <span className="hover:text-on-surface cursor-pointer">Audit Notes</span>
            <span>•</span>
            <span className="text-tertiary font-semibold">100% Deterministic Financial Model</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
