import React, { useState } from 'react';
import { UserProfile, TripInputs } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTripInputs?: TripInputs | null;
  onLoginSuccess: (user: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  pendingTripInputs,
  onLoginSuccess,
  onShowToast,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('alex.traveler@domain.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Traveler');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: 'usr-' + Date.now(),
        name: isSignUp ? (name.trim() || email.split('@')[0]) : email.split('@')[0],
        email: email.trim(),
        isLoggedIn: true,
      };
      onLoginSuccess(user);
      onShowToast(
        isSignUp
          ? `Welcome to RouteWise, ${user.name}! Account created & trip saved.`
          : `Welcome back, ${user.name}! Trip saved to your Route Vault.`
      );
      onClose();
    }, 600);
  };

  const handleSocialAuth = (provider: 'Google' | 'Instagram') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: 'usr-google-' + Date.now(),
        name: 'Alex Traveler',
        email: 'alex.traveler@gmail.com',
        avatar: '/assets/aistudio/screen_29c8d11a.png',
        isLoggedIn: true,
      };
      onLoginSuccess(user);
      onShowToast(`Connected with ${provider}. Trip saved to your Route Vault!`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl max-w-md w-full shadow-2xl border border-white/80 p-space-md md:p-space-lg relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Subtle Ambient Backdrops */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/15 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-tertiary/15 blur-2xl pointer-events-none"></div>

        {/* Header & Close Button */}
        <div className="flex items-start justify-between relative z-10 mb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/80 text-on-secondary-fixed font-label-sm text-label-sm font-semibold backdrop-blur-sm">
              <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
              <span>Authentication Required</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              {isSignUp ? 'Create Account to Save Trip' : 'Sign In to Save Trip'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center transition-colors active:scale-95"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Pending Trip Context Banner */}
        {pendingTripInputs && (
          <div className="p-3 rounded-2xl bg-surface-container-low/80 backdrop-blur-sm border border-surface-container/60 mb-space-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">bookmark_add</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-title-sm text-title-sm text-on-surface font-bold truncate">
                {pendingTripInputs.origin} ➔ {pendingTripInputs.destination}
              </div>
              <p className="font-body-sm text-body-sm text-secondary truncate">
                {pendingTripInputs.isRoundTrip ? 'Round-trip' : 'One-way'} • {pendingTripInputs.passengers} {pendingTripInputs.passengers === 1 ? 'traveller' : 'travellers'} • {pendingTripInputs.vehicle.name}
              </p>
            </div>
          </div>
        )}

        <p className="font-body-sm text-body-sm text-secondary mb-space-md">
          {isSignUp
            ? 'Sign up in seconds to save route calculations, sync FASTag tolls, and access your Route Vault anywhere.'
            : 'Sign in to store this journey in your Route Vault and access live recalculations across devices.'}
        </p>

        {/* 1-Click Social Sign-In */}
        <div className="space-y-2 mb-space-md">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialAuth('Google')}
            className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest hover:bg-white text-on-surface border border-surface-container/80 font-title-sm text-title-sm flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.99] font-medium"
          >
            <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-space-md">
          <div className="w-full bg-surface-container/80 h-[1px]"></div>
          <span className="absolute px-3 bg-surface-container-lowest/90 backdrop-blur-md text-outline font-label-sm text-label-sm rounded-full">
            or continue with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="modal-name">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  person
                </span>
                <input
                  id="modal-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Traveler"
                  className="w-full h-10 pl-9 pr-3 bg-surface-container-low/70 rounded-xl border border-surface-container text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="modal-email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                mail
              </span>
              <input
                id="modal-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.traveler@domain.com"
                className="w-full h-10 pl-9 pr-3 bg-surface-container-low/70 rounded-xl border border-surface-container text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="modal-password">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                lock
              </span>
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 bg-surface-container-low/70 rounded-xl border border-surface-container text-body-sm font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-sm text-title-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 font-bold mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                <span>{isSignUp ? 'Create Account & Save Trip' : 'Sign In & Save Trip'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-space-sm pt-2 text-center border-t border-surface-container/60">
          <p className="font-body-sm text-body-sm text-secondary">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline ml-1 font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
