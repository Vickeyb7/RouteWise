import React, { useState } from 'react';
import { TripInputs, VehicleProfile, CorridorRoute, IntermediateStop } from '../types/index.ts';
import { POPULAR_CORRIDORS } from '../data/demoData.ts';
import {
  normalizeIntermediateStops,
  reorderIntermediateStops,
  calculateTimeEfficientRouteSequence,
  formatDuration,
} from '../lib/tripCalculations.ts';
import { RouteMap } from '../components/RouteMap.tsx';

interface PlanPageProps {
  inputs: TripInputs;
  onUpdateInputs: (updated: Partial<TripInputs>) => void;
  onCompare: () => void;
  onOpenVehicleManager: () => void;
  vehicles: VehicleProfile[];
}

export const PlanPage: React.FC<PlanPageProps> = ({
  inputs,
  onUpdateInputs,
  onCompare,
  onOpenVehicleManager,
  vehicles,
}) => {
  // Local tipping group size for the interactive widget
  const [tippingGroupSize, setTippingGroupSize] = useState<number>(inputs.passengers <= 4 ? inputs.passengers : 4);
  const [isStopsDrawerOpen, setIsStopsDrawerOpen] = useState<boolean>(inputs.intermediateStops.length > 0);
  const [showRouteMap, setShowRouteMap] = useState<boolean>(true);
  const [newStopInput, setNewStopInput] = useState<string>('');
  const [newStopDuration, setNewStopDuration] = useState<number>(30);
  const [optimizationFeedback, setOptimizationFeedback] = useState<{
    timeSaved: number;
    distanceSaved: number;
    text: string;
  } | null>(null);

  const normalizedStops = normalizeIntermediateStops(inputs.intermediateStops);

  // Reorder stop dynamically
  const handleMoveStop = (fromIndex: number, toIndex: number) => {
    const updated = reorderIntermediateStops(inputs.intermediateStops, fromIndex, toIndex);
    onUpdateInputs({ intermediateStops: updated, isRouteOptimized: false });
    setOptimizationFeedback(null);
  };

  // Add stop
  const handleAddStop = () => {
    if (!newStopInput.trim()) return;
    const newStop: IntermediateStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newStopInput.trim(),
      stopDurationMinutes: newStopDuration,
    };
    onUpdateInputs({
      intermediateStops: [...normalizedStops, newStop],
      isRouteOptimized: false,
    });
    setNewStopInput('');
    setOptimizationFeedback(null);
  };

  // Remove stop
  const handleRemoveStop = (index: number) => {
    const updated = normalizedStops.filter((_, idx) => idx !== index);
    onUpdateInputs({
      intermediateStops: updated,
      isRouteOptimized: false,
    });
    setOptimizationFeedback(null);
  };

  // Optimize route sequence using TSP / shortest transit time
  const handleOptimizeRouteSequence = () => {
    if (normalizedStops.length < 2) return;
    const result = calculateTimeEfficientRouteSequence(
      inputs.origin,
      inputs.intermediateStops,
      inputs.destination
    );

    onUpdateInputs({
      intermediateStops: result.optimizedSequence,
      isRouteOptimized: true,
    });

    if (result.isReordered && (result.timeSavedMinutes > 0 || result.distanceSavedKm > 0)) {
      setOptimizationFeedback({
        timeSaved: result.timeSavedMinutes,
        distanceSaved: result.distanceSavedKm,
        text: `Route reordered for maximum efficiency! Saved ${result.distanceSavedKm} km & ${formatDuration(result.timeSavedMinutes)} of travel time.`,
      });
    } else {
      setOptimizationFeedback({
        timeSaved: 0,
        distanceSaved: 0,
        text: `Your current stop sequence is already the most time-efficient route from ${inputs.origin} to ${inputs.destination}!`,
      });
    }
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const temp = inputs.origin;
    onUpdateInputs({
      origin: inputs.destination,
      destination: temp,
    });
  };

  // Stepper for passengers
  const handlePaxChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, inputs.passengers + delta));
    onUpdateInputs({ passengers: newCount });
    if (newCount <= 4) {
      setTippingGroupSize(newCount);
    }
  };

  // Load a preset corridor
  const handleLoadCorridor = (corridor: CorridorRoute) => {
    onUpdateInputs({
      origin: corridor.origin,
      destination: corridor.destination,
      isRoundTrip: false,
    });
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cost models for the Group Tipping Point Calculator
  const tippingModels: Record<number, { car: string; train: string; flight: string; note: string }> = {
    1: {
      car: '₹4,230',
      train: '₹2,475',
      flight: '₹10,030',
      note: 'Solo travelers save the most on Trains and Sleeper Buses.',
    },
    2: {
      car: '₹2,115',
      train: '₹1,975',
      flight: '₹5,015',
      note: 'At 2 pax, Train remains the absolute lowest cost per person.',
    },
    3: {
      car: '₹1,410',
      train: '₹1,808',
      flight: '₹4,450',
      note: 'Tipping Point reached! Driving is now cheaper than group bus and close to rail.',
    },
    4: {
      car: '₹1,057',
      train: '₹1,725',
      flight: '₹4,357',
      note: 'Driving crushes trains and saves over 75% versus commercial flights!',
    },
  };

  const currentTipping = tippingModels[tippingGroupSize] || tippingModels[4];

  return (
    <div className="flex flex-col w-full">
      {/* 1. SEARCH HERO SEGMENT */}
      <section className="relative w-full overflow-hidden bg-surface py-space-lg lg:py-space-xl">
        {/* Ambient Visual Gradient Orbs */}
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-tertiary-fixed/20 blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin relative z-10">
          {/* Headline & Intro */}
          <div className="max-w-3xl mb-space-lg">
            <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mb-space-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>True Door-to-Door Multimodal Financial Telemetry</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface tracking-tight mb-space-xs leading-tight">
              Every route has a cost. <br className="hidden sm:block" />
              <span className="text-primary">Find the one that works for you.</span>
            </h1>
            <p className="font-body-md md:font-body-lg text-secondary">
              Compare driving, bus, train and flight costs—including terminal transfers, live fuel index, highway toll plazas, and true elapsed travel time.
            </p>
          </div>

          {/* Core Trip Planning Console Card */}
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl p-space-md md:p-space-lg relative border border-surface-container">
            {/* Top Toolbar: One-Way vs Round Trip & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md mb-space-md border-b border-surface-container">
              {/* Trip Type Segmented Control */}
              <div className="inline-flex p-1 rounded-lg bg-surface-container-low">
                <button
                  type="button"
                  onClick={() => onUpdateInputs({ isRoundTrip: false })}
                  className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-all ${
                    !inputs.isRoundTrip
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  One-Way
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateInputs({ isRoundTrip: true })}
                  className={`px-space-md py-1.5 rounded-lg font-title-sm text-title-sm transition-all ${
                    inputs.isRoundTrip
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              {/* Status and Method link */}
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-primary text-base">ev_station</span>
                  <span className="text-on-surface font-semibold">FASTag Live</span>
                  <span className="text-tertiary font-bold ml-1">Synced</span>
                </div>
                <div className="h-4 w-[1px] bg-outline-variant hidden sm:block"></div>
                <button
                  onClick={onOpenVehicleManager}
                  className="hidden sm:inline-flex items-center gap-1 text-primary hover:text-primary-container font-title-sm text-title-sm transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">garage</span>
                  <span>Vehicle Garage</span>
                </button>
              </div>
            </div>

            {/* Main Query Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-gutter items-center">
              {/* Origin & Destination with Swap Interlock */}
              <div className="lg:col-span-5 relative flex flex-col sm:flex-row items-center gap-space-xs">
                {/* Origin */}
                <div className="w-full bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/40">
                  <span className="material-symbols-outlined text-primary text-xl">trip_origin</span>
                  <div className="flex-1 min-w-0">
                    <label className="block font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={inputs.origin}
                      onChange={e => onUpdateInputs({ origin: e.target.value })}
                      placeholder="Starting city"
                      className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none truncate"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label="Swap origin and destination"
                  className="z-20 sm:-mx-3 my-1 sm:my-0 flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-secondary transition-all shadow-md active:rotate-180"
                >
                  <span className="material-symbols-outlined text-base">swap_horiz</span>
                </button>

                {/* Destination */}
                <div className="w-full bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-transparent focus-within:border-primary/40">
                  <span
                    className="material-symbols-outlined text-tertiary text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    location_on
                  </span>
                  <div className="flex-1 min-w-0">
                    <label className="block font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={inputs.destination}
                      onChange={e => onUpdateInputs({ destination: e.target.value })}
                      placeholder="Destination city"
                      className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Date Selector */}
              <div className="lg:col-span-2">
                <div className="w-full bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-xl">calendar_month</span>
                  <div className="flex-1 min-w-0">
                    <label className="block font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                      Departure
                    </label>
                    <input
                      type="date"
                      value={inputs.departureDate}
                      onChange={e => onUpdateInputs({ departureDate: e.target.value })}
                      className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Passengers Stepper */}
              <div className="lg:col-span-2">
                <div className="w-full bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="material-symbols-outlined text-secondary text-xl">group</span>
                    <div className="min-w-0">
                      <label className="block font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                        Passengers
                      </label>
                      <div className="font-title-md text-title-md text-on-surface truncate">
                        {inputs.passengers} {inputs.passengers === 1 ? 'Traveller' : 'Travellers'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePaxChange(-1)}
                      className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface font-bold text-sm transition-colors active:scale-95"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaxChange(1)}
                      className="w-7 h-7 rounded bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-on-surface font-bold text-sm transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle Preset Filter */}
              <div className="lg:col-span-3">
                <div className="w-full bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-xl">directions_car</span>
                  <div className="flex-1 min-w-0">
                    <label className="block font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                      Vehicle Profile
                    </label>
                    <select
                      value={inputs.vehicle.id}
                      onChange={e => {
                        const v = vehicles.find(item => item.id === e.target.value);
                        if (v) onUpdateInputs({ vehicle: v });
                      }}
                      className="w-full bg-transparent font-title-sm text-title-sm text-on-surface focus:outline-none cursor-pointer truncate"
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.mileage} {v.mileageUnit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Intermediate Stops (Waypoints) Management Console */}
            <div className="mt-space-sm pt-space-sm border-t border-surface-container">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStopsDrawerOpen(!isStopsDrawerOpen)}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-title-sm text-title-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isStopsDrawerOpen ? 'remove_circle_outline' : 'add_location_alt'}
                    </span>
                    <span>
                      {normalizedStops.length > 0
                        ? `Intermediate Stops & Waypoints (${normalizedStops.length})`
                        : '+ Add Intermediate Stops / Waypoints'}
                    </span>
                    <span
                      className="material-symbols-outlined text-sm transition-transform duration-200"
                      style={{ transform: isStopsDrawerOpen ? 'rotate(180deg)' : 'none' }}
                    >
                      expand_more
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRouteMap(!showRouteMap)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      showRouteMap
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-surface-container-low border-surface-container text-secondary hover:text-on-surface'
                    }`}
                    title="Toggle Live Route & Waypoints Map"
                  >
                    <span className="material-symbols-outlined text-[15px]">map</span>
                    <span>{showRouteMap ? 'Hide Route Map' : 'Show Route Map'}</span>
                  </button>
                </div>

                {normalizedStops.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleOptimizeRouteSequence}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim font-label-md text-label-md font-bold transition-all shadow-xs active:scale-95"
                    title="Automatically reorder stops to calculate the shortest transit time from origin to destination"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>⚡ Optimize Route Sequence</span>
                  </button>
                )}
              </div>

              {/* Live Interactive Route Map */}
              {showRouteMap && (
                <div className="mt-3">
                  <RouteMap
                    inputs={inputs}
                    height="280px"
                    className="shadow-sm border border-surface-container"
                  />
                </div>
              )}

              {/* Optimization Feedback Badge */}
              {optimizationFeedback && (
                <div className="mt-2 p-2.5 rounded-xl bg-tertiary-container/30 border border-tertiary/30 text-on-surface flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-lg shrink-0 mt-0.5">verified</span>
                  <div className="text-body-sm text-body-sm font-medium flex-1">
                    {optimizationFeedback.text}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOptimizationFeedback(null)}
                    className="text-secondary hover:text-on-surface text-sm ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Waypoints Drawer */}
              {isStopsDrawerOpen && (
                <div className="mt-3 p-3 rounded-xl bg-surface-container-low/80 border border-surface-container space-y-3">
                  {/* Stops List */}
                  {normalizedStops.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-label-sm font-label-sm text-secondary">
                        <span>Route Waypoints Sequence ({inputs.origin} ➔ {inputs.destination})</span>
                        <span className="text-xs">Use ↑ ↓ buttons to dynamically reorder</span>
                      </div>
                      {normalizedStops.map((stop, index) => (
                        <div
                          key={stop.id || index}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-lowest border border-surface-container shadow-2xs hover:border-primary/40 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-title-sm text-title-sm text-on-surface truncate block font-medium">
                                {stop.name}
                              </span>
                              <span className="text-[11px] text-secondary">
                                {stop.stopDurationMinutes || 30} min pitstop allowance
                              </span>
                            </div>
                          </div>

                          {/* Reordering Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, index - 1)}
                              disabled={index === 0}
                              aria-label={`Move ${stop.name} earlier in route`}
                              className="w-7 h-7 rounded bg-surface-container hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-on-surface text-sm transition-colors"
                              title="Move stop earlier"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, index + 1)}
                              disabled={index === normalizedStops.length - 1}
                              aria-label={`Move ${stop.name} later in route`}
                              className="w-7 h-7 rounded bg-surface-container hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-on-surface text-sm transition-colors"
                              title="Move stop later"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(index)}
                              aria-label={`Remove ${stop.name}`}
                              className="w-7 h-7 rounded bg-surface-container hover:bg-error-container hover:text-error flex items-center justify-center text-secondary text-sm transition-colors ml-1"
                              title="Remove stop"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-sm text-secondary text-sm">
                      No intermediate stops added yet. Add pitstops, scenic waypoints, or meal junctions along your corridor.
                    </p>
                  )}

                  {/* Add New Stop Input Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-surface-container">
                    <div className="relative flex-1 w-full">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary text-base">
                        add_location
                      </span>
                      <input
                        type="text"
                        value={newStopInput}
                        onChange={e => setNewStopInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddStop();
                          }
                        }}
                        placeholder="Add stop (e.g. Satara, Kolhapur, Belgaum)"
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={newStopDuration}
                        onChange={e => setNewStopDuration(Number(e.target.value))}
                        className="py-1.5 px-2 rounded-lg bg-surface-container-lowest border border-surface-container text-body-sm text-on-surface text-xs focus:outline-none"
                      >
                        <option value={15}>15m quick tea</option>
                        <option value={30}>30m meal stop</option>
                        <option value={45}>45m refuel & food</option>
                        <option value={60}>60m long break</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddStop}
                        disabled={!newStopInput.trim()}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title-sm text-xs hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                      >
                        + Add Waypoint
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / CTA Drawer inside Hero Card */}
            <div className="mt-space-md pt-space-md border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm flex-wrap text-secondary font-label-md text-label-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-sm">calculate</span>
                  <span>
                    Auto cost-split: <strong className="ml-1 text-on-surface">{Math.round(100 / inputs.passengers)}% per passenger</strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-tertiary">check_circle</span>
                  <span>NHAI FASTag toll database auto-mapped</span>
                </span>
              </div>

              <div className="flex items-center gap-space-md w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onCompare}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-6 py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary-container shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                >
                  <span>Compare my trip</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-space-md text-on-surface">
            <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">local_gas_station</span>
              </div>
              <div className="min-w-0">
                <div className="font-numeric-data-md text-numeric-data-md">₹104.21 / L</div>
                <div className="font-label-sm text-label-sm text-secondary truncate">Maharashtra Petrol Rate</div>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-2xl">toll</span>
              </div>
              <div className="min-w-0">
                <div className="font-numeric-data-md text-numeric-data-md">₹620 Total</div>
                <div className="font-label-sm text-label-sm text-secondary truncate">4 FASTag Expressways</div>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-2xl">conversion_path</span>
              </div>
              <div className="min-w-0">
                <div className="font-numeric-data-md text-numeric-data-md">462.4 km</div>
                <div className="font-label-sm text-label-sm text-secondary truncate">AH47 & NH66 Corridor</div>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">speed</span>
              </div>
              <div className="min-w-0">
                <div className="font-numeric-data-md text-numeric-data-md">8h 45m</div>
                <div className="font-label-sm text-label-sm text-secondary truncate">Estimated Driving Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION: WHAT YOU CAN COMPARE (4 TRANSIT MODES BENTO) */}
      <section className="w-full py-space-xl bg-surface-container-low border-t border-surface-container">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                Uncompromising Breakdown
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">What You Can Compare</h2>
              <p className="font-body-md text-body-md text-secondary mt-1 max-w-xl">
                Every commute option is broken down to its raw ledger: ticketing, dynamic highway tolls, final-mile cabs, and wait time penalties.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-3 py-1 rounded-full">
                Benchmarked route: Pune ➔ Goa (450 km)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Mode 1: Car */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                    <span className="material-symbols-outlined text-2xl">directions_car</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/80 text-on-secondary-container font-label-sm text-label-sm font-semibold backdrop-blur-sm">
                    High Flexibility
                  </span>
                </div>

                {/* Personal Car Mountain Road Image */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner mb-space-sm group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/assets/aistudio/screen_5350671f.png"
                    alt="Scenic Western Ghats mountain road curves with personal car"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end justify-between p-2">
                    <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-primary-fixed">directions_car</span>
                      <span>Western Ghats Pass</span>
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                      Personal Car
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Personal Car</h3>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                  Real mileage calibrated by road incline, live FASTag toll deductions, and destination parking.
                </p>
                <div className="space-y-space-xs mb-space-md font-body-sm text-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Fuel (450 km @ 15 km/L)</span>
                    <span className="font-semibold text-on-surface">₹3,150</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">FASTag Highway Tolls</span>
                    <span className="font-semibold text-on-surface">₹600</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Parking & Waypoint Tea</span>
                    <span className="font-semibold text-on-surface">₹700</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-surface-container-low/80 backdrop-blur-sm p-space-sm rounded-xl flex items-center justify-between border border-surface-container/50">
                  <div>
                    <div className="font-label-sm text-label-sm text-secondary">Total (Fixed Group)</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-primary font-bold">₹4,450</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-sm text-label-sm text-secondary">Door-to-Door</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-on-surface">9h 30m</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 2: Bus */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary shadow-xs">
                    <span className="material-symbols-outlined text-2xl">directions_bus</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high/80 text-on-surface-variant font-label-sm text-label-sm font-semibold backdrop-blur-sm">
                    Budget Sleeper
                  </span>
                </div>

                {/* Authentic Intercity AC Sleeper Bus Image */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner mb-space-sm group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/assets/aistudio/ac_sleeper_bus.png"
                    alt="Multi-Axle Volvo AC Sleeper Luxury Coach"
                    className="w-full h-full object-cover object-center"
                    onError={e => {
                      e.currentTarget.src =
                        'https://upload.wikimedia.org/wikipedia/commons/b/b4/KSRTC%27S_Ambaari_Dream_Class.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end justify-between p-2">
                    <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-secondary-fixed">directions_bus</span>
                      <span>Volvo AC Sleeper</span>
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                      Multi-Axle Coach
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Intercity Bus</h3>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                  Express multi-axle luxury sleeper berth plus auto/cab transfers at boarding and drop terminals.
                </p>
                <div className="space-y-space-xs mb-space-md font-body-sm text-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">AC Sleeper (2 Tickets)</span>
                    <span className="font-semibold text-on-surface">₹1,800</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Origin / Dest Autos</span>
                    <span className="font-semibold text-on-surface">₹500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Hotel Night Saved</span>
                    <span className="font-semibold text-tertiary">-₹1,200 net</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-surface-container-low/80 backdrop-blur-sm p-space-sm rounded-xl flex items-center justify-between border border-surface-container/50">
                  <div>
                    <div className="font-label-sm text-label-sm text-secondary">2 Travellers Total</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">₹2,300</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-sm text-label-sm text-secondary">Door-to-Door</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-on-surface">11h 00m</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 3: Train */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm flex flex-col justify-between group border-2 border-tertiary/70">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary shadow-xs">
                    <span className="material-symbols-outlined text-2xl">train</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold uppercase shadow-xs">
                    Lowest Cost
                  </span>
                </div>

                {/* Train Viaduct Scenery Image */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner mb-space-sm group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/assets/aistudio/screen_48695467.png"
                    alt="Modern express train along scenic Western Ghats rail bridge"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end justify-between p-2">
                    <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">train</span>
                      <span>Konkan Viaduct</span>
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-tertiary/80 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                      Dudhsagar Views
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Train (Konkan Railway)</h3>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                  Station transfers, reservation fees, dynamic IRCTC charges and Madgaon onward transport.
                </p>
                <div className="space-y-space-xs mb-space-md font-body-sm text-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">3AC / CC Tickets (2 pax)</span>
                    <span className="font-semibold text-on-surface">₹1,400</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Pune/Madgaon Station Cabs</span>
                    <span className="font-semibold text-on-surface">₹400</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Scenic Dudhsagar Pass</span>
                    <span className="font-semibold text-tertiary">Included</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-surface-container-low/80 backdrop-blur-sm p-space-sm rounded-xl flex items-center justify-between border border-surface-container/50">
                  <div>
                    <div className="font-label-sm text-label-sm text-secondary">2 Travellers Total</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-tertiary font-bold">₹1,800</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-sm text-label-sm text-secondary">Door-to-Door</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-on-surface">11h 30m</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 4: Flight */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm flex flex-col justify-between group border-2 border-primary/70">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
                    <span className="material-symbols-outlined text-2xl">flight</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold uppercase shadow-xs">
                    Fastest
                  </span>
                </div>

                {/* Commercial Flight Airplane Window Image */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner mb-space-sm group-hover:scale-[1.01] transition-transform">
                  <img
                    src="/assets/aistudio/screen_29c8d11a.png"
                    alt="Commercial flight cruising above sunset clouds over wing"
                    className="w-full h-full object-cover object-center"
                    onError={e => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end justify-between p-2">
                    <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-primary-fixed">flight</span>
                      <span>Air Cabin Sunrise</span>
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-primary/80 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                      1h 15m Airtime
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Commercial Flight</h3>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                  Airfares, airport premium city cabs, security lines, baggage handling, and runway buffer.
                </p>
                <div className="space-y-space-xs mb-space-md font-body-sm text-body-sm">
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Base Airfare (2 Pax)</span>
                    <span className="font-semibold text-on-surface">₹7,600</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">PNQ & Mopa Airport Taxis</span>
                    <span className="font-semibold text-error">₹2,600</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary">Airport Security & Buffer</span>
                    <span className="font-semibold text-on-surface">2h 00m</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-surface-container-low/80 backdrop-blur-sm p-space-sm rounded-xl flex items-center justify-between border border-surface-container/50">
                  <div>
                    <div className="font-label-sm text-label-sm text-secondary">2 Travellers Total</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">₹10,200</div>
                  </div>
                  <div className="text-right">
                    <div className="font-label-sm text-label-sm text-secondary">Door-to-Door</div>
                    <div className="font-numeric-data-md text-numeric-data-md text-primary font-bold">4h 30m</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: WHY DOOR-TO-DOOR COST MATTERS (INFOGRAPHIC) */}
      <section className="w-full py-space-xl bg-surface">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="max-w-2xl mb-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Unseen Surcharges
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Why Door-to-Door Cost Matters</h2>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Airfares look fast, but city edge airports cost up to 34% of your travel budget in cab fares and 3 hours in airport security queues.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            {/* Visual Timeline Bar */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container">
              <div className="font-title-md text-title-md text-on-surface mb-space-md flex items-center justify-between">
                <span>Hidden Expense Journey Breakdown (Pune ➔ Goa)</span>
                <span className="font-label-sm text-label-sm text-secondary">2 Adults Comparison</span>
              </div>

              {/* Flight Breakdown Bar */}
              <div className="mb-space-lg space-y-space-xs">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-base">flight</span>
                    <span>Flight (Advertised Base: ₹7,600)</span>
                  </span>
                  <span className="text-error font-bold">Total: ₹10,200 (+34.2% Hidden Cabs)</span>
                </div>
                <div className="w-full h-8 rounded-lg overflow-hidden flex font-label-sm text-label-sm text-on-primary">
                  <div className="h-full bg-secondary flex items-center justify-center px-2 truncate" style={{ width: '8%' }} title="PNQ Airport Taxi: ₹600">
                    Cab ₹600
                  </div>
                  <div className="h-full bg-primary flex items-center justify-center px-2 truncate" style={{ width: '72%' }} title="Airfare: ₹7,600">
                    Airfare: ₹7,600
                  </div>
                  <div className="h-full bg-error flex items-center justify-center px-2 truncate" style={{ width: '20%' }} title="Goa Mopa Taxi: ₹2,000">
                    Goa Cab: ₹2,000
                  </div>
                </div>
                <div className="flex justify-between text-secondary font-label-sm text-label-sm pt-1">
                  <span>Cab to Airport (1h 10m)</span>
                  <span>Security & Gate Wait (2h 00m)</span>
                  <span>Flight (1h 15m)</span>
                  <span>Arrival Cab (1h 05m)</span>
                </div>
              </div>

              {/* Driving Breakdown Bar */}
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between font-label-md text-label-md">
                  <span className="font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-base">directions_car</span>
                    <span>Car (Direct Road Trip)</span>
                  </span>
                  <span className="text-tertiary font-bold">Total: ₹4,450 (Zero terminal transfers)</span>
                </div>
                <div className="w-full h-8 rounded-lg overflow-hidden flex font-label-sm text-label-sm text-on-primary">
                  <div className="h-full bg-primary-container flex items-center justify-center px-2 truncate" style={{ width: '71%' }} title="Fuel: ₹3,150">
                    Fuel: ₹3,150
                  </div>
                  <div className="h-full bg-tertiary flex items-center justify-center px-2 truncate" style={{ width: '13%' }} title="Tolls: ₹600">
                    Tolls: ₹600
                  </div>
                  <div className="h-full bg-secondary flex items-center justify-center px-2 truncate" style={{ width: '16%' }} title="Food/Tea: ₹700">
                    Food: ₹700
                  </div>
                </div>
                <div className="flex justify-between text-secondary font-label-sm text-label-sm pt-1">
                  <span>Drive starts at doorstep</span>
                  <span>Scenic Western Ghats Break (30m)</span>
                  <span>Door-to-door delivery</span>
                </div>
              </div>
            </div>

            {/* Reality Check Bento Cards */}
            <div className="lg:col-span-4 space-y-space-md">
              <div className="p-space-md rounded-2xl bg-surface-container-low border border-surface-container text-on-surface shadow-sm">
                <div className="flex items-center gap-space-sm mb-space-xs">
                  <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">local_taxi</span>
                  </div>
                  <span className="font-title-sm text-title-sm font-semibold">Airport Cab Surcharge</span>
                </div>
                <div className="font-numeric-data-lg text-numeric-data-lg text-error font-bold">₹2,600</div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Average two-way airport cab fare between metro and coastal zones. Frequently omitted by typical flight portals.
                </p>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-low border border-surface-container text-on-surface shadow-sm">
                <div className="flex items-center gap-space-sm mb-space-xs">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">hourglass_top</span>
                  </div>
                  <span className="font-title-sm text-title-sm font-semibold">Dead Transit Overhead</span>
                </div>
                <div className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">3h 15m</div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Time spent in security, baggage claims, and taxi pickups. Your 1-hour flight is actually 4.5 hours door-to-door.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: THE GROUP TIPPING POINT CALCULATOR (DYNAMIC WIDGET) */}
      <section className="w-full py-space-xl bg-surface-container-low border-t border-surface-container">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="text-center max-w-3xl mx-auto mb-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Mathematical Economics
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">The Group Tipping Point Calculator</h2>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Solo travelers thrive on rail and buses. Groups of 3 or more invert the curve: driving suddenly undercuts buses and crushes flights by over 70%.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm border border-surface-container">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container mb-space-lg">
              <div>
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  Select Travel Group Size:
                </span>
                <p className="font-body-sm text-body-sm text-secondary">
                  Watch the per-person financial threshold rebalance instantaneously.
                </p>
              </div>

              {/* Group Size Buttons */}
              <div className="inline-flex rounded-lg bg-surface-container-high p-1">
                {[1, 2, 3, 4].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTippingGroupSize(size)}
                    className={`px-4 py-2 rounded-lg font-title-sm text-title-sm transition-all ${
                      tippingGroupSize === size
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                        : 'text-secondary hover:text-on-surface'
                    }`}
                  >
                    {size} {size === 1 ? 'Person' : 'Persons'} {size === 4 ? '(Optimal)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
              {/* Car */}
              <div className="p-space-md rounded-xl bg-surface border-2 border-primary/20 relative shadow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
                  {tippingGroupSize >= 3 ? 'Cheapest Group Option' : 'Fixed Cost Split'}
                </div>
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-space-sm">
                  <span className="material-symbols-outlined text-2xl">directions_car</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-semibold">Car (Fixed Cost Split)</h4>
                <div className="my-space-sm">
                  <div className="font-numeric-data-lg text-numeric-data-lg text-primary font-bold">
                    {currentTipping.car}
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">
                    per person ({tippingGroupSize} pax)
                  </span>
                </div>
                <p className="text-secondary font-body-sm text-body-sm border-t border-surface-container pt-space-xs">
                  Fixed car cost shared across {tippingGroupSize} travelers. Freedom to stop anytime.
                </p>
              </div>

              {/* Train */}
              <div className="p-space-md rounded-xl bg-surface border border-surface-container shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-tertiary mb-space-sm">
                  <span className="material-symbols-outlined text-2xl">train</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-semibold">Train (Linear Scaled)</h4>
                <div className="my-space-sm">
                  <div className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                    {currentTipping.train}
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">
                    per person ({tippingGroupSize} pax)
                  </span>
                </div>
                <p className="text-secondary font-body-sm text-body-sm border-t border-surface-container pt-space-xs">
                  Every passenger pays seat ticket + shared station arrival cab fees.
                </p>
              </div>

              {/* Flight */}
              <div className="p-space-md rounded-xl bg-surface border border-surface-container shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-space-sm">
                  <span className="material-symbols-outlined text-2xl">flight</span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-semibold">Flight (Heavy Per-Seat)</h4>
                <div className="my-space-sm">
                  <div className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                    {currentTipping.flight}
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">
                    per person ({tippingGroupSize} pax)
                  </span>
                </div>
                <p className="text-secondary font-body-sm text-body-sm border-t border-surface-container pt-space-xs">
                  {tippingGroupSize}x Airfares + airport taxi overhead.
                </p>
              </div>
            </div>

            <div className="mt-space-md p-3 rounded-lg bg-surface-container-low text-center text-body-sm text-secondary">
              <strong className="text-on-surface">Insight: </strong>
              {currentTipping.note}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: POPULAR OPTIMIZED CORRIDORS */}
      <section className="w-full py-space-xl bg-surface border-t border-surface-container">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="flex items-center justify-between mb-space-lg">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                Ready Calculations
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Popular Optimized Corridors</h2>
              <p className="font-body-md text-body-md text-secondary mt-1">
                Pre-computed live benchmarks across India's busiest transit corridors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {POPULAR_CORRIDORS.map(corridor => {
              const isSelected =
                inputs.origin.toLowerCase().includes(corridor.origin.split(',')[0].toLowerCase()) &&
                inputs.destination.toLowerCase().includes(corridor.destination.split(',')[0].toLowerCase());

              return (
                <div
                  key={corridor.id}
                  className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between border ${
                    isSelected ? 'border-2 border-primary/40 ring-2 ring-primary/10' : 'border-surface-container'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-space-xs">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                        {corridor.distanceKm} km
                      </span>
                      <span>{corridor.viaHighway.split('/')[0].trim()}</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors font-bold">
                      {corridor.popularName}
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      {corridor.scenicPass || corridor.viaHighway}
                    </p>

                    <div className="mt-space-md space-y-1.5 font-label-md text-label-md">
                      <div className="flex justify-between text-on-surface">
                        <span className="text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">directions_car</span> Car (Total)
                        </span>
                        <span className="font-bold">
                          ₹
                          {corridor.id === 'pune-goa'
                            ? '4,450'
                            : corridor.id === 'mumbai-pune'
                            ? '1,840'
                            : corridor.id === 'delhi-jaipur'
                            ? '2,950'
                            : '3,410'}
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface">
                        <span className="text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">train</span> Train (Per pax)
                        </span>
                        <span className="font-bold text-tertiary">
                          ₹{corridor.defaultTransitCosts ? corridor.defaultTransitCosts.trainFareSingle : 700}
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface">
                        <span className="text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">flight</span> Flight (Per pax)
                        </span>
                        <span className="font-bold">
                          ₹{corridor.defaultTransitCosts ? corridor.defaultTransitCosts.flightAirfareSingle : 3800}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
                    <span className="text-tertiary font-label-sm text-label-sm font-semibold">
                      {corridor.id === 'pune-goa'
                        ? 'Scenic Western Ghats'
                        : corridor.id === 'mumbai-pune'
                        ? 'Train: Save 79%'
                        : 'Vande Bharat Ready'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLoadCorridor(corridor)}
                      className="text-primary hover:text-primary-container font-title-sm text-title-sm flex items-center gap-1"
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1 font-bold">
                          Active <span className="material-symbols-outlined text-sm">check</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          Load <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION: DATA TRANSPARENCY & VERIFIED SOURCES */}
      <section className="w-full py-space-xl bg-surface-container-low border-t border-surface-container" id="transparency">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
              <div>
                <div className="inline-flex items-center gap-space-xs px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm mb-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>100% Deterministic Financial Model</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Data Transparency & Verified Sources
                </h2>
                <p className="font-body-md text-body-md text-secondary mt-1">
                  RouteWise does not use generalized approximations. We tap directly into statutory feeds.
                </p>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="p-space-sm rounded-xl bg-surface-container text-right">
                  <div className="font-label-sm text-label-sm text-secondary">Latest Toll Matrix Sync</div>
                  <div className="font-numeric-data-md text-numeric-data-md text-tertiary font-bold">
                    06:00 IST Today
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter font-body-sm text-body-sm">
              {/* Source 1 */}
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-xs">
                    <span className="material-symbols-outlined text-primary text-xl">local_gas_station</span>
                    <strong className="text-on-surface font-title-sm text-title-sm">IOCL & BPCL Fuel APIs</strong>
                  </div>
                  <p className="text-secondary mb-space-sm">
                    Daily revised pump rates synchronized across 28 states & union territories down to municipal district borders.
                  </p>
                </div>
                <div className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Live daily index
                </div>
              </div>

              {/* Source 2 */}
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-xs">
                    <span className="material-symbols-outlined text-primary text-xl">toll</span>
                    <strong className="text-on-surface font-title-sm text-title-sm">NHAI Toll Information</strong>
                  </div>
                  <p className="text-secondary mb-space-sm">
                    National Highway Authority of India FASTag plazas with exact vehicle classification rates and return concessions.
                  </p>
                </div>
                <div className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 980+ Plazas Mapped
                </div>
              </div>

              {/* Source 3 */}
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-xs">
                    <span className="material-symbols-outlined text-tertiary text-xl">train</span>
                    <strong className="text-on-surface font-title-sm text-title-sm">IRCTC Dynamic Tariffs</strong>
                  </div>
                  <p className="text-secondary mb-space-sm">
                    Indian Railways PRS timetable matrix, tatkal surcharges, catering fees and dynamic fare surges on Premium Specials.
                  </p>
                </div>
                <div className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Class-Specific CC/3A
                </div>
              </div>

              {/* Source 4 */}
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-xs">
                    <span className="material-symbols-outlined text-primary text-xl">flight_takeoff</span>
                    <strong className="text-on-surface font-title-sm text-title-sm">DGCA Regulatory Guidelines</strong>
                  </div>
                  <p className="text-secondary mb-space-sm">
                    Civil aviation passenger charters, standardized hand baggage allowances, fuel surcharges, and airport development fees (UDF).
                  </p>
                </div>
                <div className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Standard UDF/ADF
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
