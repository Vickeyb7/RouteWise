import React, { useState } from 'react';
import { TripInputs, VehicleProfile, IntermediateStop } from '../types/index.ts';
import { DEFAULT_VEHICLES } from '../data/demoData.ts';
import { loadSavedVehicles } from '../lib/storage.ts';
import {
  normalizeIntermediateStops,
  reorderIntermediateStops,
  calculateTimeEfficientRouteSequence,
  formatDuration,
} from '../lib/tripCalculations.ts';

interface AssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: TripInputs;
  onSaveInputs: (updated: TripInputs) => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({
  isOpen,
  onClose,
  inputs,
  onSaveInputs,
}) => {
  if (!isOpen) return null;

  const [formState, setFormState] = useState<TripInputs>({ ...inputs });
  const [newStop, setNewStop] = useState('');
  const allVehicles = loadSavedVehicles().length > 0 ? loadSavedVehicles() : DEFAULT_VEHICLES;

  const handleSelectVehiclePreset = (vId: string) => {
    const selected = allVehicles.find(v => v.id === vId);
    if (selected) {
      setFormState(prev => ({
        ...prev,
        vehicle: { ...selected },
      }));
    }
  };

  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);

  const handleAddStop = () => {
    if (!newStop.trim()) return;
    const stopObj: IntermediateStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newStop.trim(),
      stopDurationMinutes: 30,
    };
    setFormState(prev => ({
      ...prev,
      intermediateStops: [...prev.intermediateStops, stopObj],
      isRouteOptimized: false,
    }));
    setNewStop('');
    setOptimizationNotice(null);
  };

  const handleRemoveStop = (idx: number) => {
    setFormState(prev => ({
      ...prev,
      intermediateStops: prev.intermediateStops.filter((_, i) => i !== idx),
      isRouteOptimized: false,
    }));
    setOptimizationNotice(null);
  };

  const handleMoveStop = (fromIdx: number, toIdx: number) => {
    setFormState(prev => ({
      ...prev,
      intermediateStops: reorderIntermediateStops(prev.intermediateStops, fromIdx, toIdx),
      isRouteOptimized: false,
    }));
    setOptimizationNotice(null);
  };

  const handleOptimizeSequence = () => {
    if (formState.intermediateStops.length < 2) return;
    const result = calculateTimeEfficientRouteSequence(
      formState.origin,
      formState.intermediateStops,
      formState.destination
    );
    setFormState(prev => ({
      ...prev,
      intermediateStops: result.optimizedSequence,
      isRouteOptimized: true,
    }));
    if (result.isReordered && (result.timeSavedMinutes > 0 || result.distanceSavedKm > 0)) {
      setOptimizationNotice(
        `Optimized! Saved ${result.distanceSavedKm} km & ${formatDuration(result.timeSavedMinutes)}.`
      );
    } else {
      setOptimizationNotice('Current order is already the fastest route!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInputs(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Trip & Vehicle Assumptions</h3>
              <p className="font-body-sm text-body-sm text-secondary">Fine-tune calculations and efficiency parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-space-md overflow-y-auto space-y-space-md">
          {/* 1. Vehicle Selection & Specs */}
          <div className="space-y-3 bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">directions_car</span>
                Vehicle Profile & Specs
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                {formState.vehicle.fuelType.toUpperCase()}
              </span>
            </div>

            {/* Vehicle Preset Selector */}
            <div>
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                Choose Preset Vehicle
              </label>
              <select
                value={formState.vehicle.id}
                onChange={e => handleSelectVehiclePreset(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-title-sm text-title-sm focus:outline-none"
              >
                {allVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.mileage} {v.mileageUnit} • ₹{v.fuelPrice}/{v.fuelType === 'cng' ? 'kg' : 'L'})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Mileage & Fuel Price Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Mileage ({formState.vehicle.mileageUnit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  max="60"
                  value={formState.vehicle.mileage}
                  onChange={e =>
                    setFormState(prev => ({
                      ...prev,
                      vehicle: { ...prev.vehicle, mileage: Number(e.target.value) },
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-numeric-data-md text-numeric-data-md"
                  required
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Fuel Price (₹ per unit)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="10"
                  max="200"
                  value={formState.vehicle.fuelPrice}
                  onChange={e =>
                    setFormState(prev => ({
                      ...prev,
                      vehicle: { ...prev.vehicle, fuelPrice: Number(e.target.value) },
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-numeric-data-md text-numeric-data-md"
                  required
                />
              </div>
            </div>

            {/* Terrain & Highway Profile */}
            <div>
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                Route Terrain & Incline Factor
              </label>
              <select
                value={formState.vehicle.terrainAdjustment}
                onChange={e =>
                  setFormState(prev => ({
                    ...prev,
                    vehicle: { ...prev.vehicle, terrainAdjustment: Number(e.target.value) },
                  }))
                }
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none"
              >
                <option value={1.0}>Standard Expressway (Normal 1.0x)</option>
                <option value={0.9}>Mountain Ghats / Incline (High resistance 0.9x efficiency)</option>
                <option value={0.85}>Severe Ghat Curves & Monsoon (+15% fuel burn)</option>
                <option value={1.1}>Cruising Flat Corridor (Optimal +10% efficiency)</option>
              </select>
            </div>
          </div>

          {/* 2. Route Parameters & Passengers */}
          <div className="space-y-3 bg-surface-container-low p-3.5 rounded-xl border border-surface-container">
            <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
              Passengers & Route Corridor
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Origin City
                </label>
                <input
                  type="text"
                  value={formState.origin}
                  onChange={e => setFormState(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-body-md"
                  required
                />
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Destination City
                </label>
                <input
                  type="text"
                  value={formState.destination}
                  onChange={e => setFormState(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-body-md"
                  required
                />
              </div>
            </div>

            {/* Passenger Count & Round Trip */}
            <div className="grid grid-cols-2 gap-3 items-center pt-1">
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Passenger Count (Pax)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormState(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))
                    }
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-surface-container font-bold text-on-surface flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface w-8 text-center">
                    {formState.passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState(prev => ({ ...prev, passengers: Math.min(10, prev.passengers + 1) }))
                    }
                    className="w-9 h-9 rounded-lg bg-primary text-on-primary font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.isRoundTrip}
                    onChange={e => setFormState(prev => ({ ...prev, isRoundTrip: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-title-sm text-title-sm text-on-surface">Calculate Round-Trip (x2)</span>
                </label>
              </div>
            </div>

            {/* Optional Intermediate Waypoints */}
            <div className="pt-2">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                Intermediate Waypoint Stops (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Satara, Kolhapur"
                  value={newStop}
                  onChange={e => setNewStop(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStop();
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container text-body-sm text-on-surface focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-title-sm text-title-sm"
                >
                  Add Stop
                </button>
              </div>

              {/* Optimization Action and Notice */}
              {formState.intermediateStops.length >= 2 && (
                <div className="flex items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleOptimizeSequence}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold hover:bg-tertiary-fixed-dim transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>⚡ Optimize Route Sequence</span>
                  </button>
                  {optimizationNotice && (
                    <span className="text-xs text-tertiary font-medium">{optimizationNotice}</span>
                  )}
                </div>
              )}

              {formState.intermediateStops.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <div className="text-[11px] text-secondary flex justify-between">
                    <span>Route Waypoint Order</span>
                    <span>Use ↑ ↓ to reorder</span>
                  </div>
                  {normalizeIntermediateStops(formState.intermediateStops).map((stop, i, arr) => (
                    <div
                      key={stop.id || i}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm border border-surface-container-highest/60"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium">{stop.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveStop(i, i - 1)}
                          disabled={i === 0}
                          className="w-5 h-5 rounded bg-surface-container-high hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                          title="Move stop earlier"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStop(i, i + 1)}
                          disabled={i === arr.length - 1}
                          className="w-5 h-5 rounded bg-surface-container-high hover:bg-surface-variant disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
                          title="Move stop later"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(i)}
                          className="w-5 h-5 rounded hover:bg-error-container hover:text-error text-secondary flex items-center justify-center text-sm ml-1"
                          title="Remove stop"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-surface-container text-secondary font-title-sm text-title-sm hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container shadow-md"
            >
              Save & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
