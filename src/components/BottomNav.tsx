import React from 'react';
import { LiquidNavbar, LiquidNavItem } from './ui/liquid-glass-navbar.tsx';

interface BottomNavProps {
  currentTab: 'plan' | 'compare' | 'my-trips' | 'profile';
  onNavigate: (tab: 'plan' | 'compare' | 'my-trips' | 'profile') => void;
  savedTripsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, savedTripsCount }) => {
  const tabMap: ('plan' | 'compare' | 'my-trips' | 'profile')[] = [
    'plan',
    'compare',
    'my-trips',
    'profile',
  ];

  const activeIndex = Math.max(0, tabMap.indexOf(currentTab));

  const mobileNavItems: LiquidNavItem[] = [
    {
      label: 'Plan',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
      fx: 'glow',
    },
    {
      label: 'Compare',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      fx: 'pop',
    },
    {
      label: savedTripsCount > 0 ? `Trips (${savedTripsCount})` : 'Trips',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      fx: 'plane',
    },
    {
      label: 'Vault',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      fx: 'wave',
    },
  ];

  return (
    <div className="fixed bottom-3 inset-x-3 z-50 lg:hidden flex justify-center pointer-events-none pb-safe">
      <div className="pointer-events-auto shadow-[0_12px_36px_-6px_rgba(20,36,58,0.18),0_4px_16px_rgba(0,40,90,0.1)] rounded-full backdrop-blur-2xl bg-white/70 border border-white/90 p-1">
        <LiquidNavbar
          items={mobileNavItems}
          active={activeIndex}
          onChange={(idx) => onNavigate(tabMap[idx])}
          tone="light"
          sound={false}
        />
      </div>
    </div>
  );
};
