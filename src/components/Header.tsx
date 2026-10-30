import React from 'react';
import { UserProfile } from '../types/index.ts';
import { LiquidNavbar, LiquidNavItem } from './ui/liquid-glass-navbar.tsx';

interface HeaderProps {
  currentTab: 'plan' | 'compare' | 'my-trips' | 'profile';
  onNavigate: (tab: 'plan' | 'compare' | 'my-trips' | 'profile') => void;
  savedTripsCount: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  savedTripsCount,
  currentUser,
  onOpenAuth,
}) => {
  const tabMap: ('plan' | 'compare' | 'my-trips' | 'profile')[] = [
    'plan',
    'compare',
    'my-trips',
    'profile',
  ];

  const activeIndex = Math.max(0, tabMap.indexOf(currentTab));

  const desktopNavItems: LiquidNavItem[] = [
    {
      label: 'Plan a Trip',
      icon: (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
      fx: 'glow',
    },
    {
      label: 'Compare Travel',
      icon: (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      fx: 'pop',
    },
    {
      label: savedTripsCount > 0 ? `My Trips (${savedTripsCount})` : 'My Trips',
      icon: (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      fx: 'plane',
    },
    {
      label: 'Route Vault',
      icon: (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      fx: 'wave',
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface/85 backdrop-blur-2xl shadow-[0_4px_24px_-4px_rgba(20,36,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] border-b border-white/60">
      {/* Top Telemetry Strip with liquid frosted glass */}
      <div className="bg-surface-container-high/60 backdrop-blur-md py-1.5 px-margin-mobile md:px-margin-tablet lg:px-margin border-b border-surface-container/30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-semibold text-on-surface">NHAI FASTag & State Fuel Radar</span>
            <span className="text-outline hidden sm:inline">• 100% Deterministic Financial Model</span>
          </div>
          <div className="hidden md:flex items-center gap-space-md">
            <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              National Highway Plazas: Synced
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">IOCL/BPCL Fuel Index: Today</span>
            <span className="text-outline font-label-sm text-label-sm">Engine: v2.4.1</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar with Liquid Glass Effect */}
      <div className="h-16 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md lg:gap-space-xl">
          {/* Logo */}
          <button
            onClick={() => onNavigate('plan')}
            className="flex items-center gap-space-sm text-left focus:outline-none group shrink-0"
            type="button"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-[0_2px_10px_rgba(0,64,218,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">alt_route</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface tracking-tight font-bold leading-none">
                RouteWise
              </span>
              <span className="font-label-sm text-label-sm text-outline leading-tight mt-0.5">
                Cost Intelligence
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links with Liquid Glass Effect */}
          <div className="hidden lg:block">
            <LiquidNavbar
              items={desktopNavItems}
              active={activeIndex}
              onChange={(idx) => onNavigate(tabMap[idx])}
              tone="light"
              sound={false}
              className="shadow-sm border border-white/80"
            />
          </div>
        </div>

        {/* Right Section: Currency, Quick CTA, Auth & Profile */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
            <span className="text-tertiary font-bold">₹</span>
            <span className="font-semibold">INR</span>
          </div>

          <button
            onClick={() => onNavigate('compare')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm transition-all shadow-xs active:scale-95 border border-surface-container"
            type="button"
          >
            <span>Compare Now</span>
          </button>

          {currentUser ? (
            <button
              onClick={() => onNavigate('profile')}
              aria-label="Profile"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all border ${
                currentTab === 'profile'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-surface-container bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
              type="button"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-title-sm text-title-sm hidden md:inline font-semibold">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-all shadow-sm active:scale-95 font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
