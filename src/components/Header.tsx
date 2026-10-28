import React from 'react';
import { UserProfile } from '../types/index.ts';

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
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,36,58,0.04)]">
      {/* Top Telemetry Strip */}
      <div className="bg-surface-container-high/70 backdrop-blur-md py-1.5 px-margin-mobile md:px-margin-tablet lg:px-margin border-b border-surface-container/40">
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

      {/* Main Navigation Bar */}
      <div className="h-16 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          {/* Logo */}
          <button
            onClick={() => onNavigate('plan')}
            className="flex items-center gap-space-sm text-left focus:outline-none group"
            type="button"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-[0_2px_6px_rgba(49,92,245,0.25)] group-hover:scale-105 transition-transform">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-lg bg-surface-container-low">
            <button
              onClick={() => onNavigate('plan')}
              className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-colors ${
                currentTab === 'plan'
                  ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              type="button"
            >
              Plan a Trip
            </button>
            <button
              onClick={() => onNavigate('compare')}
              className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-colors ${
                currentTab === 'compare'
                  ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              type="button"
            >
              Compare Travel
            </button>
            <button
              onClick={() => onNavigate('my-trips')}
              className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-colors flex items-center gap-1.5 ${
                currentTab === 'my-trips'
                  ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              type="button"
            >
              <span>My Trips</span>
              {savedTripsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                  {savedTripsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-colors ${
                currentTab === 'profile'
                  ? 'bg-secondary-container text-on-secondary-fixed font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              type="button"
            >
              Route Vault
            </button>
          </nav>
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
