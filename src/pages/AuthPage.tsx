import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';

interface AuthPageProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onShowToast,
  onSuccess,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('Alex Traveler');
  const [email, setEmail] = useState('alex.traveler@domain.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user: UserProfile = {
        id: 'usr-' + Date.now(),
        name: isRegisterMode ? (name.trim() || email.split('@')[0]) : email.split('@')[0],
        email: email.trim(),
        isLoggedIn: true,
      };
      onLogin(user);
      onShowToast(
        isRegisterMode
          ? 'RouteWise workspace created! Telemetry synced.'
          : 'Welcome back! Route Vault and FASTag telemetry active.'
      );
      onSuccess();
    }, 700);
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
      onLogin(user);
      onShowToast(`Connected via ${provider}. Cloud session synced.`);
      onSuccess();
    }, 600);
  };

  if (currentUser) {
    return (
      <div className="flex flex-col w-full py-space-md md:py-space-xl min-h-[calc(100vh-160px)]">
        <div className="max-w-[700px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin w-full space-y-space-md">
          <div className="glass-panel rounded-3xl p-space-md md:p-space-lg shadow-xl border border-white/80 space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-bold text-headline-sm flex items-center justify-center shadow-md">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-semibold mb-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                    <span>Authenticated Member</span>
                  </div>
                  <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {currentUser.name}
                  </h1>
                  <p className="font-body-sm text-body-sm text-secondary">{currentUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onShowToast('Signed out of RouteWise');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-error-container/30 hover:text-error text-secondary font-label-md text-label-md transition-all active:scale-95 flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>

            {/* Cloud Status Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">cloud_done</span>
                </div>
                <div>
                  <div className="font-title-sm text-title-sm text-on-surface font-semibold">Route Vault Cloud Sync</div>
                  <div className="font-label-sm text-label-sm text-tertiary font-medium">Active & Encrypted</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">toll</span>
                </div>
                <div>
                  <div className="font-title-sm text-title-sm text-on-surface font-semibold">NHAI FASTag Radar</div>
                  <div className="font-label-sm text-label-sm text-tertiary font-medium">State-Level Toll Cache</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onSuccess}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-title-sm text-title-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">commute</span>
                <span>View My Saved Trips</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-space-md md:py-space-xl">
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
        {/* Left Column: Perks, Social Proof & Trust Badges */}
        <div className="lg:col-span-5 flex flex-col space-y-space-md order-2 lg:order-1 pr-0 lg:pr-space-md">
          <div className="inline-flex items-center gap-space-xs self-start px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm shadow-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Multi-Modal Travel Cloud Sync</span>
          </div>

          <div className="space-y-space-xs">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface tracking-tight font-bold leading-tight">
              Save your journey calculations & travel findings
            </h1>
            <p className="font-body-md md:font-body-lg text-secondary">
              Keep door-to-door comparisons, vehicle profiles, and group split models persistent across all your devices.
            </p>
          </div>

          {/* Perks Cards List */}
          <div className="grid grid-cols-1 gap-space-sm pt-space-xs">
            <div className="flex items-start gap-space-sm p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow duration-200 border border-surface-container">
              <div className="p-2.5 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-headline-sm">route</span>
              </div>
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Unlimited Multi-Waypoint Route Vault
                </div>
                <p className="font-body-sm text-body-sm text-secondary truncate">
                  Pune ➔ Goa, Delhi ➔ Jaipur with live expressway and toll updates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-space-sm p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow duration-200 border border-surface-container">
              <div className="p-2.5 rounded-xl bg-surface-container text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-headline-sm">group_add</span>
              </div>
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Group Tipping Point & Split Links
                </div>
                <p className="font-body-sm text-body-sm text-secondary truncate">
                  Real-time fair shares for fuel, FASTag tolls, driver allowance, and pitstops
                </p>
              </div>
            </div>

            <div className="flex items-start gap-space-sm p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow duration-200 border border-surface-container">
              <div className="p-2.5 rounded-xl bg-surface-container text-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-headline-sm">notifications_active</span>
              </div>
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface font-semibold">
                  State Fuel & FASTag Radar
                </div>
                <p className="font-body-sm text-body-sm text-secondary truncate">
                  Automatic alerts when NHAI toll matrices revise or interstate pump prices drop
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-4 rounded-2xl bg-surface-container-low/70 flex items-center gap-space-md border border-surface-container">
            <div className="flex -space-x-2">
              <img
                src="/assets/aistudio/screen_ed422fd3.png"
                alt="Traveler 1"
                className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest object-cover"
                onError={e => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDYHRhqYd3_7rO0DYyB8vDciMBduRZDJlRPJWYs2YyiFK6KzAT8zQqF4rTEh0D1NEZnvGfT1_4VlUuSFQ0CfM0Zq7xIgo91RVMjk9fw7yAsmqPEewcs3Z1JszpssQ4xPrzuWuNvyj6JSwZoCwtAX0nzkBrkF6Bgp_XBjlk4ySqqdHzqcjnYlrmgizohDvr33RimAcuGlmeww-nGTzmAadKdqAuTcCiQLH4RRtW34LmYDUlNjRsG8Sjf4g';
                }}
              />
              <img
                src="/assets/aistudio/screen_63c35ce8.png"
                alt="Traveler 2"
                className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest object-cover"
                onError={e => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAUU9YdfIct_cNt2ZbN1inofaV9eYArO_FZQl0mEXHshgfUjCFn4pRtcxqHlHWVczuPdmemtzvKpy6IM4ZYw3HeUh0vSuPhnyKpiSDhHnvKDeaEpxOJPn3uknKJBXQAOSR1nVBPvomQGt0aKE5cSbIjHsV-TX4KQXy3yBvt4Hh5lRvDQLXqbFOuo7TzDja1ytj1ZdqVC_LaGrslSabjPL0wnDV7Nh9dV9B-6868BQVbr5189IHj8Gf1Cw';
                }}
              />
              <img
                src="/assets/aistudio/screen_29c8d11a.png"
                alt="Traveler 3"
                className="w-8 h-8 rounded-full ring-2 ring-surface-container-lowest object-cover"
                onError={e => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuD5seXF_3KBKezVemRzocLhcuVlK8Rn8g9in6lYwLTF1d5OfuYw53msCb5PqpAg-QDFh9x2kManelcKSslmw7oKMCPT8DpzY2WreRmBHTAbKY4E-oddDs9UUk09GmJ_pF3XHP2AQKPrRwcQdnSJJb1SoYiRRU8I3qfqUFWh6tzIHCyj6rK2fRHmZpWusT_uOcgKunLli51RAtmgZjaRhgz2Z7cr6cY3eymSec_S0fDSaJ7hWa7mclyFnQ';
                }}
              />
            </div>
            <div className="text-on-surface-variant font-label-md text-label-md">
              <span className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">42,800+</span> trips
              simulated this month with ±1.8% cost precision
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 flex justify-center order-1 lg:order-2">
          <div className="w-full max-w-[540px] bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-xl border border-surface-container relative">
            {/* Scenic Road Accent Banner */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden mb-space-md shadow-sm border border-surface-container">
              <img
                src="/assets/aistudio/screen_7bef2822.png"
                alt="Scenic coastal highway leading to Goa"
                className="w-full h-full object-cover object-center"
                onError={e => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDsd8hXA9wDsojHVkaVzpF05l-Ip0U-DHQZC7uO3uuZIYvNa49v9yv4nybutKu2Ix8hJifgn7tDENrt6p2MFO7pACH566x9aPpyAvFZj4AgxZFL_b1Yf_A0oAA72ETcNvP4RVZ8SFgPlN3soVs_RI88oixEhOpHaV8ueLXzmHjG3JBxt-bCcN9tjDprxt9Yhqrqv590zQRlOUuSz9r30Zkdb-UFbch9zqkAAwcU4gKv85r5WACUEhrRuw';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent flex items-end justify-between p-3">
                <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  <span>NHAI Fleet Sync Ready</span>
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-2.5 py-0.5 rounded-full font-semibold">
                  256-Bit SSL Cloud
                </span>
              </div>
            </div>

            {/* Gateway Title */}
            <div className="flex items-center justify-between pb-space-xs">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Authentication Gateway
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                  {isRegisterMode ? 'Create RouteWise Account' : 'Sign In to RouteWise'}
                </h2>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                <span>Secure</span>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-secondary mb-space-md">
              Access your calibrated cost itineraries, FASTag wallets, and custom EV efficiency profiles.
            </p>

            {/* Social Authentication Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="flex items-center justify-center gap-2.5 h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-150 border border-surface-container text-on-surface font-title-sm text-title-sm active:scale-95"
              >
                <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  ></path>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Instagram')}
                className="flex items-center justify-center gap-2.5 h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-150 border border-surface-container text-on-surface font-title-sm text-title-sm active:scale-95"
              >
                <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center p-[2px] shrink-0">
                  <svg aria-hidden="true" className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </div>
                <span>Continue with Instagram</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-space-md">
              <div className="w-full bg-surface-container h-[1px]"></div>
              <span className="absolute px-3 bg-surface-container-lowest text-outline font-label-sm text-label-sm">
                or continue with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-space-md">
              <div className="space-y-1.5">
                <label className="font-title-sm text-title-sm text-on-surface" htmlFor="auth-email">
                  Account Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    mail
                  </span>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex.traveler@domain.com"
                    required
                    className="w-full h-11 pl-11 pr-4 bg-surface-container-low text-on-surface font-body-md rounded-xl border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-title-sm text-title-sm text-on-surface" htmlFor="auth-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onShowToast('Password reset link sent to your email.')}
                    className="font-label-md text-label-md text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                    lock
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11 pl-11 pr-11 bg-surface-container-low text-on-surface font-body-md rounded-xl border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:border-primary/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Remember this device for 30 days
                  </span>
                </label>
                <span className="font-label-sm text-label-sm text-tertiary hidden sm:inline-flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Hardware MFA Ready
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 font-semibold"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Free Account & Sync' : 'Sign In to RouteWise'}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-space-md text-center">
              <p className="font-body-md text-body-md text-secondary">
                {isRegisterMode ? 'Already have an account?' : "Don't have a RouteWise workspace yet?"}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="font-title-sm text-title-sm text-primary hover:underline ml-1 font-semibold"
                >
                  {isRegisterMode ? 'Sign in to existing account' : 'Create a free account'}
                </button>
              </p>
            </div>

            {/* Privacy encryption card */}
            <div className="mt-space-md p-3.5 rounded-xl bg-surface-container-low flex items-start gap-space-sm border border-surface-container">
              <span className="material-symbols-outlined text-outline shrink-0 text-[18px] mt-0.5">
                enhanced_encryption
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                RouteWise enforces bank-grade 256-bit payload encryption. We never sell raw telemetry, waypoint history, or individual vehicle mileage profiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
