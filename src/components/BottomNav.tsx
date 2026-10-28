import React from 'react';

interface BottomNavProps {
  currentTab: 'plan' | 'compare' | 'my-trips' | 'profile';
  onNavigate: (tab: 'plan' | 'compare' | 'my-trips' | 'profile') => void;
  savedTripsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, savedTripsCount }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(20,36,58,0.06)] lg:hidden border-t border-surface-container">
      <div className="flex items-center justify-around h-16 px-gutter-mobile">
        {/* Plan Tab */}
        <button
          onClick={() => onNavigate('plan')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'plan' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'plan' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            explore
          </span>
          <span className="font-label-sm text-label-sm tracking-tight">Plan</span>
        </button>

        {/* Compare Tab */}
        <button
          onClick={() => onNavigate('compare')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'compare' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'compare' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            stacked_bar_chart
          </span>
          <span className="font-label-sm text-label-sm tracking-tight">Compare</span>
        </button>

        {/* My Trips Tab */}
        <button
          onClick={() => onNavigate('my-trips')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors relative ${
            currentTab === 'my-trips' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'my-trips' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            commute
          </span>
          <span className="font-label-sm text-label-sm tracking-tight">My Trips</span>
          {savedTripsCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] flex items-center justify-center font-bold">
              {savedTripsCount}
            </span>
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
            currentTab === 'profile' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          type="button"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={currentTab === 'profile' ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            account_circle
          </span>
          <span className="font-label-sm text-label-sm tracking-tight">Vault</span>
        </button>
      </div>
    </nav>
  );
};
