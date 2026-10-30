import React, { useState } from 'react';
import { SavedTrip, VehicleProfile, TripInputs, UserProfile } from '../types/index.ts';
import { calculateTripCosts, formatINR } from '../lib/tripCalculations.ts';

interface MyTripsPageProps {
  savedTrips: SavedTrip[];
  vehicles: VehicleProfile[];
  activeVehicleId: string;
  onLoadTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (id: string) => void;
  onOpenVehicleManager: () => void;
  currentInputs: TripInputs;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  savedTrips,
  vehicles,
  activeVehicleId,
  onLoadTrip,
  onDeleteTrip,
  onOpenVehicleManager,
  currentInputs,
  currentUser,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'scenarios' | 'vehicles'>('trips');

  // Scenario Comparison State
  const [scenarioVehicleId, setScenarioVehicleId] = useState<string>(
    vehicles.find(v => v.id !== activeVehicleId)?.id || vehicles[0]?.id || ''
  );
  const [scenarioPassengers, setScenarioPassengers] = useState<number>(4);
  const [scenarioFuelPrice, setScenarioFuelPrice] = useState<number>(currentInputs.vehicle.fuelPrice);

  // Baseline calculation (Scenario A)
  const baselineResult = calculateTripCosts(currentInputs);

  // Scenario B inputs & calculation
  const scenarioVehicle = vehicles.find(v => v.id === scenarioVehicleId) || currentInputs.vehicle;
  const scenarioInputs: TripInputs = {
    ...currentInputs,
    passengers: scenarioPassengers,
    vehicle: {
      ...scenarioVehicle,
      fuelPrice: scenarioFuelPrice,
    },
  };
  const scenarioResult = calculateTripCosts(scenarioInputs);

  // Cost difference calculations
  const totalDelta = scenarioResult.totalDrivingCost - baselineResult.totalDrivingCost;
  const perPersonDelta = scenarioResult.costPerPerson - baselineResult.costPerPerson;

  // In-app deletion confirmation state
  const [tripToDelete, setTripToDelete] = useState<SavedTrip | null>(null);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-160px)]">
      {/* In-App Confirmation Dialog for Deleting Trips */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-md">
          <div className="glass-panel rounded-2xl p-space-md max-w-sm w-full shadow-2xl border border-white/80 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">Delete Saved Trip?</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Are you sure you want to remove &quot;{tripToDelete.title}&quot; from your saved vault? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container/60">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-secondary hover:text-on-surface font-title-sm text-title-sm transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTrip(tripToDelete.id);
                  setTripToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 font-title-sm text-title-sm font-semibold shadow-sm transition-colors active:scale-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto w-full px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md md:py-space-lg space-y-space-md">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm glass-panel p-space-md rounded-2xl shadow-sm border border-white/70">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/80 text-on-secondary-fixed font-label-sm text-label-sm font-semibold mb-1 backdrop-blur-sm shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">bookmark</span>
              <span>Saved Route Vault</span>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-bold">
              My Trips, Vehicles & Scenarios
            </h1>
            <p className="font-body-md text-body-md text-secondary mt-0.5">
              Review saved calculations, compare vehicle alternatives, and manage fleet efficiencies.
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-surface-container self-start sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('trips')}
              className={`px-4 py-1.5 rounded-lg font-title-sm text-title-sm transition-all ${
                activeTab === 'trips'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Saved Trips ({savedTrips.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-1.5 rounded-lg font-title-sm text-title-sm transition-all ${
                activeTab === 'scenarios'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Scenario Simulator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-1.5 rounded-lg font-title-sm text-title-sm transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Vehicle Garage ({vehicles.length})
            </button>
          </div>
        </div>

        {/* Visitor Alert Banner if not logged in */}
        {!currentUser && (
          <div className="glass-panel rounded-2xl p-space-md border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">person_outline</span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">
                  Browsing as a Visitor
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  You can plan trips and compare costs freely. To save routes, sync vehicle profiles, and access your Route Vault across devices, please log in or sign up.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-all active:scale-95 shadow-sm font-semibold shrink-0"
            >
              Log In or Sign Up
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 1: SAVED TRIPS LIST                   */}
        {/* ========================================= */}
        {activeTab === 'trips' && (
          <div className="space-y-space-md">
            {savedTrips.length === 0 ? (
              <div className="glass-panel rounded-2xl p-space-xl text-center border border-white/70 shadow-sm space-y-space-sm max-w-xl mx-auto my-space-lg">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mx-auto">
                  <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {currentUser ? 'No Saved Trips Yet' : 'Log In to Save Trips'}
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  {currentUser
                    ? 'When you plan or compare a journey, click "Save Trip" on the Compare screen to store it here.'
                    : 'Visitors must log in or sign up to save trips to their personal Route Vault.'}
                </p>
                {!currentUser && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container shadow-md active:scale-95 font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Log In or Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {savedTrips.map(trip => (
                  <div
                    key={trip.id}
                    className="glass-card-interactive rounded-2xl p-space-md shadow-sm border border-white/70 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          <span>{trip.summary.distanceKm} km</span>
                        </span>
                        <span className="font-label-sm text-label-sm text-outline">
                          {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold group-hover:text-primary transition-colors">
                          {trip.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary">
                          {trip.inputs.origin} ➔ {trip.inputs.destination} ({trip.inputs.isRoundTrip ? 'Round-trip' : 'One-way'})
                        </p>
                        {trip.inputs.intermediateStops && trip.inputs.intermediateStops.length > 0 && (
                          <div className="text-[11px] text-primary flex items-center gap-1 font-medium truncate mt-0.5">
                            <span className="material-symbols-outlined text-[13px]">alt_route</span>
                            <span className="truncate">
                              Via {trip.inputs.intermediateStops.map(s => (typeof s === 'string' ? s : s.name)).join(' ➔ ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Summary Specs */}
                      <div className="bg-surface-container-low p-2.5 rounded-xl space-y-1 text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-secondary">Car Driving Total:</span>
                          <span className="font-bold text-on-surface">{formatINR(trip.summary.totalCarCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Cost per Person ({trip.inputs.passengers} pax):</span>
                          <span className="font-bold text-primary">{formatINR(trip.summary.costPerPerson)}</span>
                        </div>
                        <div className="flex justify-between text-label-sm text-outline pt-1 border-t border-surface-container">
                          <span>Vehicle:</span>
                          <span className="text-on-surface font-medium truncate">{trip.inputs.vehicle.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setTripToDelete(trip)}
                        className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors flex items-center gap-1"
                        title="Delete saved trip"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                        <span className="font-label-sm text-label-sm font-semibold">Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLoadTrip(trip)}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-all flex items-center gap-1 shadow-sm font-semibold active:scale-95"
                      >
                        <span>Reopen Trip</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: SCENARIO COMPARISON SIMULATOR      */}
        {/* ========================================= */}
        {activeTab === 'scenarios' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm border border-surface-container space-y-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                Hypothetical Ledger Modeling
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                Scenario Comparison: Vehicle & Group Sensitivity
              </h2>
              <p className="font-body-md text-body-md text-secondary">
                Model how different engines, fluctuating pump prices, and additional passengers impact trip budget.
              </p>
            </div>

            {/* Scenario Configuration Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Alternate Vehicle (Scenario B)
                </label>
                <select
                  value={scenarioVehicleId}
                  onChange={e => setScenarioVehicleId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface font-title-sm text-title-sm focus:outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.mileage} {v.mileageUnit} • {v.fuelType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Sensitivity Fuel Price (₹ per unit)
                </label>
                <input
                  type="number"
                  step="1"
                  min="20"
                  max="200"
                  value={scenarioFuelPrice}
                  onChange={e => setScenarioFuelPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface font-numeric-data-md"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Passenger Group Size (Pax)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScenarioPassengers(p => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-surface-container text-on-surface font-bold text-title-sm"
                  >
                    -
                  </button>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface w-10 text-center font-bold">
                    {scenarioPassengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setScenarioPassengers(p => Math.min(10, p + 1))}
                    className="w-10 h-10 rounded-xl bg-primary text-on-primary font-bold text-title-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pt-space-xs">
              {/* Baseline: Scenario A */}
              <div className="bg-surface rounded-2xl p-space-md border-2 border-surface-container space-y-space-sm">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                      Baseline (Scenario A)
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1">
                      {currentInputs.vehicle.name}
                    </h3>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    {currentInputs.passengers} traveller{currentInputs.passengers > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-1.5 text-body-sm font-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Fuel Consumed:</span>
                    <span className="font-semibold text-on-surface">
                      {baselineResult.fuelConsumptionUnits} {currentInputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Fuel Expense:</span>
                    <span className="font-semibold text-on-surface">{formatINR(baselineResult.fuelCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Tolls + Extras:</span>
                    <span className="font-semibold text-on-surface">
                      {formatINR(baselineResult.tollCost + baselineResult.includedExpensesTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between mt-space-md">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary block">Total Car Driving Cost</span>
                    <span className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                      {formatINR(baselineResult.totalDrivingCost)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-secondary block">Per Person</span>
                    <span className="font-numeric-data-md text-numeric-data-md text-primary font-bold">
                      {formatINR(baselineResult.costPerPerson)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensitivity: Scenario B */}
              <div className="bg-surface rounded-2xl p-space-md border-2 border-primary/40 space-y-space-sm shadow-sm">
                <div className="flex items-center justify-between pb-1 border-b border-surface-container">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                      Simulation (Scenario B)
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mt-1">
                      {scenarioVehicle.name}
                    </h3>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    {scenarioPassengers} traveller{scenarioPassengers > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-1.5 text-body-sm font-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Fuel Consumed:</span>
                    <span className="font-semibold text-on-surface">
                      {scenarioResult.fuelConsumptionUnits} {scenarioVehicle.fuelType === 'cng' ? 'kg' : 'L'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Fuel Expense:</span>
                    <span className="font-semibold text-on-surface">{formatINR(scenarioResult.fuelCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container/60">
                    <span className="text-secondary">Tolls + Extras:</span>
                    <span className="font-semibold text-on-surface">
                      {formatINR(scenarioResult.tollCost + scenarioResult.includedExpensesTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between mt-space-md">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary block">Total Car Driving Cost</span>
                    <span className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                      {formatINR(scenarioResult.totalDrivingCost)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-secondary block">Per Person</span>
                    <span className="font-numeric-data-md text-numeric-data-md text-tertiary font-bold">
                      {formatINR(scenarioResult.costPerPerson)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delta Ledger Callout */}
            <div className="p-space-md rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-surface-container">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    perPersonDelta <= 0 ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error-container text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {perPersonDelta <= 0 ? 'trending_down' : 'trending_up'}
                  </span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    Net Per-Person Variance:{' '}
                    <span className={perPersonDelta <= 0 ? 'text-tertiary' : 'text-error'}>
                      {perPersonDelta <= 0 ? `- ₹${Math.abs(perPersonDelta)}` : `+ ₹${perPersonDelta}`}
                    </span>
                  </h4>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Total group delta is {totalDelta <= 0 ? `- ₹${Math.abs(totalDelta)} saved` : `+ ₹${totalDelta} extra`}
                    {' '}using shared calculation formulas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: VEHICLE GARAGE OVERVIEW            */}
        {/* ========================================= */}
        {activeTab === 'vehicles' && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm border border-surface-container space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Fleet Inventory
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
                  Calibrated Vehicle Profiles
                </h2>
                <p className="font-body-md text-body-md text-secondary">
                  Configure real-world mileage and pump prices for accurate cost calculations.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenVehicleManager}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Manage Vehicles</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pt-space-xs">
              {vehicles.map(v => {
                const isActive = v.id === activeVehicleId;
                return (
                  <div
                    key={v.id}
                    className={`p-space-md rounded-2xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-surface-container-lowest border-2 border-primary/40 ring-2 ring-primary/10 shadow-sm'
                        : 'bg-surface-container-low border-surface-container'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title-md text-title-md text-on-surface font-bold">{v.name}</span>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-body-sm font-body-sm">
                        <div className="flex justify-between text-secondary">
                          <span>Fuel Type:</span>
                          <span className="font-semibold text-on-surface capitalize">{v.fuelType}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                          <span>Mileage / Efficiency:</span>
                          <span className="font-semibold text-on-surface">
                            {v.mileage} {v.mileageUnit}
                          </span>
                        </div>
                        <div className="flex justify-between text-secondary">
                          <span>Base Fuel Price:</span>
                          <span className="font-semibold text-on-surface">
                            ₹{v.fuelPrice} / {v.fuelType === 'cng' ? 'kg' : 'L'}
                          </span>
                        </div>
                        <div className="flex justify-between text-secondary">
                          <span>Body Class:</span>
                          <span className="font-semibold text-on-surface">{v.vehicleClass}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-space-md border-t border-surface-container mt-space-sm flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline">
                        Est: ₹{((v.fuelPrice / v.mileage) || 0).toFixed(2)}/km
                      </span>
                      <button
                        type="button"
                        onClick={onOpenVehicleManager}
                        className="text-primary hover:text-primary-container font-title-sm text-title-sm font-semibold flex items-center gap-1"
                      >
                        Edit Specs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
