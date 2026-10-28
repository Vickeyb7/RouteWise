import { useState, useEffect, useMemo } from 'react';
import { TripInputs, VehicleProfile, SavedTrip, TransportModeEstimate, UserProfile } from './types/index.ts';
import { DEFAULT_VEHICLES } from './data/demoData.ts';
import { calculateTripCosts } from './lib/tripCalculations.ts';
import {
  loadSavedTrips,
  saveTrip,
  deleteSavedTrip,
  loadSavedVehicles,
  saveVehicle,
  deleteVehicle,
  getActiveVehicle,
  setActiveVehicleId,
  saveCurrentTripDraft,
  loadCurrentTripDraft,
  loadUserProfile,
  saveUserProfile,
} from './lib/storage.ts';
import { trackEvent } from './lib/analytics.ts';

import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Toast } from './components/Toast.tsx';
import { BreakdownModal } from './components/BreakdownModal.tsx';
import { AssumptionsModal } from './components/AssumptionsModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { BookingHandoffModal } from './components/BookingHandoffModal.tsx';
import { VehicleManagerModal } from './components/VehicleManagerModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

import { PlanPage } from './pages/PlanPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { MyTripsPage } from './pages/MyTripsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';

type Tab = 'plan' | 'compare' | 'my-trips' | 'profile';

export default function App() {
  // 1. Navigation state with browser history / hash support
  const [currentTab, setCurrentTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['plan', 'compare', 'my-trips', 'profile'].includes(hash)) {
        return hash as Tab;
      }
    }
    return 'compare'; // Start on Compare as showcased in Stitch mockups
  });

  // Sync hash and browser history
  const navigateTo = (tab: Tab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent(tab === 'plan' ? 'trip_search_started' : 'trip_results_viewed', { tab });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['plan', 'compare', 'my-trips', 'profile'].includes(hash)) {
        setCurrentTab(hash as Tab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Vehicles state
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(() => loadSavedVehicles());
  const [activeVehicle, setActiveVehicleState] = useState<VehicleProfile>(() => getActiveVehicle());

  // 3. Core Trip Inputs
  const [inputs, setInputs] = useState<TripInputs>(() => {
    const draft = loadCurrentTripDraft();
    if (draft) return draft;

    // Standard benchmark default: Pune -> Goa, 2 pax, Petrol Sedan
    return {
      origin: 'Pune, MH',
      destination: 'Goa, GA',
      departureDate: '2025-10-18',
      isRoundTrip: false,
      passengers: 2,
      intermediateStops: [],
      vehicle: activeVehicle || DEFAULT_VEHICLES[0],
      expenses: {
        parking: 200,
        food: 500,
        accommodation: 0,
        misc: 0,
        includeParking: true,
        includeFood: true,
        includeAccommodation: false,
        includeMisc: false,
      },
      customTolls: 600,
      useManualToll: false,
    };
  });

  // Persist inputs draft
  useEffect(() => {
    saveCurrentTripDraft(inputs);
  }, [inputs]);

  // 4. Saved Trips state: only trips explicitly saved by user
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => {
    return loadSavedTrips();
  });

  // 5. Shared Calculation Result
  const calculationResult = useMemo(() => {
    return calculateTripCosts(inputs);
  }, [inputs]);

  // 6. User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingSaveAfterAuth, setPendingSaveAfterAuth] = useState(false);

  // 7. Modal States
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVehicleManagerOpen, setIsVehicleManagerOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<TransportModeEstimate | null>(null);

  // 8. Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Helper to update inputs
  const handleUpdateInputs = (partial: Partial<TripInputs>) => {
    setInputs(prev => ({
      ...prev,
      ...partial,
    }));
    trackEvent('trip_assumptions_changed', partial);
  };

  // Select active vehicle
  const handleSelectVehicle = (vehicle: VehicleProfile) => {
    setActiveVehicleState(vehicle);
    setActiveVehicleId(vehicle.id);
    setInputs(prev => ({ ...prev, vehicle }));
    showToast(`Switched active vehicle to ${vehicle.name}`);
  };

  // Save vehicle
  const handleSaveVehicle = (vehicle: VehicleProfile) => {
    const updated = saveVehicle(vehicle);
    setVehicles(updated);
    if (activeVehicle.id === vehicle.id) {
      setActiveVehicleState(vehicle);
      setInputs(prev => ({ ...prev, vehicle }));
    }
    showToast(`Saved vehicle ${vehicle.name}`);
  };

  // Delete vehicle
  const handleDeleteVehicle = (id: string) => {
    const updated = deleteVehicle(id);
    setVehicles(updated);
    if (activeVehicle.id === id && updated[0]) {
      handleSelectVehicle(updated[0]);
    }
    showToast('Vehicle removed from garage');
  };

  // Internal helper to persist trip
  const executeSaveTrip = () => {
    const newSavedTrip: SavedTrip = {
      id: 'trip-' + Date.now(),
      title: `${inputs.origin.split(',')[0]} ➔ ${inputs.destination.split(',')[0]} Plan`,
      createdAt: new Date().toISOString(),
      inputs: { ...inputs },
      summary: {
        totalCarCost: calculationResult.totalDrivingCost,
        costPerPerson: calculationResult.costPerPerson,
        distanceKm: calculationResult.totalDistanceKm,
        passengers: inputs.passengers,
        bestMode: calculationResult.modes.find(m => m.id === calculationResult.cheapestModeId)?.title || 'Train',
      },
    };
    const updated = saveTrip(newSavedTrip);
    setSavedTrips(updated);
    showToast('Trip plan successfully saved to Route Vault!');
    trackEvent('trip_saved', { id: newSavedTrip.id });
  };

  // Save current trip to vault (requires login)
  const handleSaveCurrentTrip = () => {
    if (!currentUser) {
      setPendingSaveAfterAuth(true);
      setIsAuthModalOpen(true);
      return;
    }
    executeSaveTrip();
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveUserProfile(user);
    if (pendingSaveAfterAuth) {
      executeSaveTrip();
      setPendingSaveAfterAuth(false);
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveUserProfile(null);
    showToast('You have signed out of RouteWise.');
  };

  // Delete saved trip
  const handleDeleteSavedTrip = (id: string) => {
    const updated = deleteSavedTrip(id);
    setSavedTrips(updated);
    showToast('Trip removed from vault');
  };

  // Reopen a saved trip
  const handleLoadTrip = (trip: SavedTrip) => {
    setInputs({ ...trip.inputs });
    if (trip.inputs.vehicle) {
      setActiveVehicleState(trip.inputs.vehicle);
    }
    navigateTo('compare');
    showToast(`Loaded "${trip.title}"!`);
  };

  const isCurrentTripSaved = savedTrips.some(
    t =>
      t.inputs.origin === inputs.origin &&
      t.inputs.destination === inputs.destination &&
      t.inputs.passengers === inputs.passengers &&
      t.inputs.isRoundTrip === inputs.isRoundTrip &&
      t.inputs.vehicle.id === inputs.vehicle.id
  );

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-sans">
      {/* Toast Notification Banner */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Global Application Header */}
      <Header
        currentTab={currentTab}
        onNavigate={navigateTo}
        savedTripsCount={savedTrips.length}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Page Canvas Container */}
      <main className="flex-1 pt-24 pb-20 lg:pb-0">
        {currentTab === 'plan' && (
          <PlanPage
            inputs={inputs}
            onUpdateInputs={handleUpdateInputs}
            onCompare={() => navigateTo('compare')}
            onOpenVehicleManager={() => setIsVehicleManagerOpen(true)}
            vehicles={vehicles}
          />
        )}

        {currentTab === 'compare' && (
          <ComparePage
            inputs={inputs}
            result={calculationResult}
            onUpdateInputs={handleUpdateInputs}
            onOpenBreakdown={() => setIsBreakdownOpen(true)}
            onOpenAssumptions={() => setIsAssumptionsOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenBooking={mode => setBookingMode(mode)}
            onSaveCurrentTrip={handleSaveCurrentTrip}
            isTripSaved={isCurrentTripSaved}
          />
        )}

        {currentTab === 'my-trips' && (
          <MyTripsPage
            savedTrips={savedTrips}
            vehicles={vehicles}
            activeVehicleId={activeVehicle.id}
            onLoadTrip={handleLoadTrip}
            onDeleteTrip={handleDeleteSavedTrip}
            onOpenVehicleManager={() => setIsVehicleManagerOpen(true)}
            currentInputs={inputs}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'profile' && (
          <AuthPage
            currentUser={currentUser}
            onLogin={handleLoginSuccess}
            onLogout={handleLogout}
            onShowToast={showToast}
            onSuccess={() => navigateTo('my-trips')}
          />
        )}
      </main>

      {/* Global Application Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenMethodology={() => {
          navigateTo('compare');
          setIsBreakdownOpen(true);
        }}
      />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={navigateTo}
        savedTripsCount={savedTrips.length}
      />

      {/* ========================================= */}
      {/* INTERACTIVE MODALS & DRAWERS              */}
      {/* ========================================= */}

      {/* 1. Road-Trip Breakdown Modal */}
      <BreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        inputs={inputs}
        result={calculationResult}
        onUpdateExpenses={expenses => handleUpdateInputs({ expenses })}
        onUpdateCustomToll={(toll, useManual) =>
          handleUpdateInputs({ customTolls: toll, useManualToll: useManual })
        }
      />

      {/* 2. Assumptions Editor Modal */}
      <AssumptionsModal
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
        inputs={inputs}
        onSaveInputs={updated => handleUpdateInputs(updated)}
      />

      {/* 3. Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        inputs={inputs}
        result={calculationResult}
        onShowToast={showToast}
        onSaveTrip={handleSaveCurrentTrip}
        isTripSaved={isCurrentTripSaved}
      />

      {/* 4. Booking Handoff Modal */}
      <BookingHandoffModal
        isOpen={Boolean(bookingMode)}
        onClose={() => setBookingMode(null)}
        mode={bookingMode}
        inputs={inputs}
      />

      {/* 5. Vehicle Garage & Profiles Modal */}
      <VehicleManagerModal
        isOpen={isVehicleManagerOpen}
        onClose={() => setIsVehicleManagerOpen(false)}
        vehicles={vehicles}
        activeVehicleId={activeVehicle.id}
        onSelectVehicle={handleSelectVehicle}
        onSaveVehicle={handleSaveVehicle}
        onDeleteVehicle={handleDeleteVehicle}
      />

      {/* 6. Auth Gate Modal for Saving Trips */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingSaveAfterAuth(false);
        }}
        pendingTripInputs={inputs}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />
    </div>
  );
}
