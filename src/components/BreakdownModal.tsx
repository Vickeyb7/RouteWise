import React from 'react';
import { TripInputs, TripCalculationResult } from '../types/index.ts';
import { formatINR } from '../lib/tripCalculations.ts';

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: TripInputs;
  result: TripCalculationResult;
  onUpdateExpenses: (newExpenses: TripInputs['expenses']) => void;
  onUpdateCustomToll: (toll: number, useManual: boolean) => void;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  onClose,
  inputs,
  result,
  onUpdateExpenses,
  onUpdateCustomToll,
}) => {
  if (!isOpen) return null;

  const toggleExpense = (key: 'includeParking' | 'includeFood' | 'includeAccommodation' | 'includeMisc') => {
    onUpdateExpenses({
      ...inputs.expenses,
      [key]: !inputs.expenses[key],
    });
  };

  const updateExpenseAmount = (key: 'parking' | 'food' | 'accommodation' | 'misc', val: number) => {
    onUpdateExpenses({
      ...inputs.expenses,
      [key]: Math.max(0, val),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Road-Trip Ledger & Cost Breakdown</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                {inputs.origin} ➔ {inputs.destination} ({result.totalDistanceKm} km total)
              </p>
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

        {/* Modal Body */}
        <div className="p-space-md overflow-y-auto space-y-space-md">
          {/* Executive Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-3 rounded-xl text-center">
            <div className="bg-surface-container-lowest p-2 rounded-lg">
              <span className="font-label-sm text-label-sm text-outline block">Total Driving Cost</span>
              <span className="font-numeric-data-md text-numeric-data-md text-primary font-bold">
                {formatINR(result.totalDrivingCost)}
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg">
              <span className="font-label-sm text-label-sm text-outline block">Per Person ({inputs.passengers} pax)</span>
              <span className="font-numeric-data-md text-numeric-data-md text-tertiary font-bold">
                {formatINR(result.costPerPerson)}
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg">
              <span className="font-label-sm text-label-sm text-outline block">Fuel Consumed</span>
              <span className="font-numeric-data-md text-numeric-data-md text-on-surface">
                {result.fuelConsumptionUnits.toFixed(1)} {inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'}
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2 rounded-lg">
              <span className="font-label-sm text-label-sm text-outline block">Tolls & Cess</span>
              <span className="font-numeric-data-md text-numeric-data-md text-on-surface">
                {formatINR(result.tollCost)}
              </span>
            </div>
          </div>

          {/* Section 1: State-Wise Fuel Consumption & Pricing */}
          <div className="border border-surface-container rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-title-sm text-title-sm text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-primary">local_gas_station</span>
                <span>State-Wise Fuel Allocation</span>
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                Vehicle: {inputs.vehicle.name} ({inputs.vehicle.mileage} {inputs.vehicle.mileageUnit})
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              State-wise fuel consumption is a cost-allocation estimate based on distance traveled in each jurisdiction and local VAT rates.
            </p>

            <div className="divide-y divide-surface-container-high/60 bg-surface-container-low rounded-lg overflow-hidden">
              {result.stateSegments.map((seg, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-body-sm text-body-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">
                      {seg.stateName} ({seg.stateCode})
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      {seg.distanceKm} km segment • Pump Rate ₹{seg.fuelPricePerUnit}/unit
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-numeric-data-md text-numeric-data-md text-on-surface block">
                      {formatINR(seg.cost)}
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">
                      ~{seg.fuelConsumed} {inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: FASTag Electronic Toll Plazas */}
          <div className="border border-surface-container rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-title-sm text-title-sm text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-tertiary">toll</span>
                <span>Electronic Toll Plazas (NHAI FASTag)</span>
              </div>
              <span className="font-title-sm text-title-sm text-tertiary font-bold">
                Total: {formatINR(result.tollCost)}
              </span>
            </div>

            {result.tollPlazas && result.tollPlazas.length > 0 ? (
              <div className="divide-y divide-surface-container-high/60 bg-surface-container-low rounded-lg overflow-hidden">
                {result.tollPlazas.map((toll, idx) => (
                  <div key={toll.id || idx} className="p-2.5 px-3 flex items-center justify-between text-body-sm">
                    <div>
                      <span className="font-medium text-on-surface block">{toll.name}</span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        {toll.nhHighway} • {toll.location}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-numeric-data-md text-numeric-data-md text-on-surface">
                        {formatINR(toll.carToll * (inputs.isRoundTrip ? 2 : 1))}
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[16px]" title="FASTag Accepted">
                        check_circle
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low rounded-lg text-secondary font-body-sm">
                No automatic toll plazas mapped for this custom corridor. Use manual toll override below.
              </div>
            )}

            {/* Custom Toll Override Input */}
            <div className="pt-2 flex items-center gap-3 bg-surface-container-low/40 p-2.5 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer font-body-sm text-on-surface text-body-sm">
                <input
                  type="checkbox"
                  checked={inputs.useManualToll}
                  onChange={e => onUpdateCustomToll(inputs.customTolls || 600, e.target.checked)}
                  className="rounded text-primary focus:ring-0 accent-primary"
                />
                <span>Override Toll Total (₹):</span>
              </label>
              {inputs.useManualToll && (
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={inputs.customTolls ?? 600}
                  onChange={e => onUpdateCustomToll(Number(e.target.value), true)}
                  className="w-24 px-2 py-1 rounded bg-surface-container-lowest border border-surface-container text-on-surface font-title-sm text-title-sm focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Section 3: Additional Expenses Toggles */}
          <div className="border border-surface-container rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-title-sm text-title-sm text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
                <span>Optional Trip Expenses</span>
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                {formatINR(result.includedExpensesTotal)} included in total
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              Select which additional out-of-pocket costs to include in the grand driving total.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Parking */}
              <div
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  inputs.expenses.includeParking
                    ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                    : 'bg-surface-container-low border-transparent opacity-70'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inputs.expenses.includeParking}
                    onChange={() => toggleExpense('includeParking')}
                    className="rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-title-sm text-title-sm text-on-surface">Parking</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-secondary font-title-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.expenses.parking}
                    onChange={e => updateExpenseAmount('parking', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-surface-container-low border border-surface-container text-right font-title-sm text-title-sm"
                  />
                </div>
              </div>

              {/* Food & Pitstops */}
              <div
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  inputs.expenses.includeFood
                    ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                    : 'bg-surface-container-low border-transparent opacity-70'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inputs.expenses.includeFood}
                    onChange={() => toggleExpense('includeFood')}
                    className="rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-title-sm text-title-sm text-on-surface">Food & Tea</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-secondary font-title-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={inputs.expenses.food}
                    onChange={e => updateExpenseAmount('food', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-surface-container-low border border-surface-container text-right font-title-sm text-title-sm"
                  />
                </div>
              </div>

              {/* Accommodation */}
              <div
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  inputs.expenses.includeAccommodation
                    ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                    : 'bg-surface-container-low border-transparent opacity-70'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inputs.expenses.includeAccommodation}
                    onChange={() => toggleExpense('includeAccommodation')}
                    className="rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-title-sm text-title-sm text-on-surface">Night Halt</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-secondary font-title-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={inputs.expenses.accommodation}
                    onChange={e => updateExpenseAmount('accommodation', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-surface-container-low border border-surface-container text-right font-title-sm text-title-sm"
                  />
                </div>
              </div>

              {/* Misc */}
              <div
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  inputs.expenses.includeMisc
                    ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                    : 'bg-surface-container-low border-transparent opacity-70'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inputs.expenses.includeMisc}
                    onChange={() => toggleExpense('includeMisc')}
                    className="rounded text-primary focus:ring-0 accent-primary"
                  />
                  <span className="font-title-sm text-title-sm text-on-surface">Misc / Buffer</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-secondary font-title-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={inputs.expenses.misc}
                    onChange={e => updateExpenseAmount('misc', Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-surface-container-low border border-surface-container text-right font-title-sm text-title-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2 text-outline font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span>Ledger reconciles 100% with grand total</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-colors shadow-sm"
            type="button"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
