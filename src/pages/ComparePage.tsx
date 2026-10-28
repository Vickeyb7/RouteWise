import React, { useState } from 'react';
import { TripInputs, TripCalculationResult, TransportModeEstimate } from '../types/index.ts';
import { formatINR } from '../lib/tripCalculations.ts';
import { TripCostPieChart } from '../components/TripCostPieChart.tsx';

interface ComparePageProps {
  inputs: TripInputs;
  result: TripCalculationResult;
  onUpdateInputs: (updated: Partial<TripInputs>) => void;
  onOpenBreakdown: () => void;
  onOpenAssumptions: () => void;
  onOpenShare: () => void;
  onOpenBooking: (mode: TransportModeEstimate) => void;
  onSaveCurrentTrip: () => void;
  isTripSaved: boolean;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  inputs,
  result,
  onUpdateInputs,
  onOpenBreakdown,
  onOpenAssumptions,
  onOpenShare,
  onOpenBooking,
  onSaveCurrentTrip,
  isTripSaved,
}) => {
  // Toggle between Total Group Cost and Cost Per Person view
  const [viewPerPerson, setViewPerPerson] = useState(false);
  // Transparent calculation accordion state
  const [showFormulas, setShowFormulas] = useState(false);
  // Selected mode for deep-dive pie chart breakdown (defaulting to personal car road trip)
  const [selectedModeId, setSelectedModeId] = useState<string>('car');

  const carMode = result.modes.find(m => m.id === 'car')!;
  const busMode = result.modes.find(m => m.id === 'bus')!;
  const trainMode = result.modes.find(m => m.id === 'train')!;
  const flightMode = result.modes.find(m => m.id === 'flight')!;

  const getModePriceDisplay = (mode: TransportModeEstimate) => {
    return viewPerPerson ? formatINR(mode.costPerPerson) : formatINR(mode.totalCost);
  };

  const getModePriceSubtext = (mode: TransportModeEstimate) => {
    return viewPerPerson
      ? `Total: ${formatINR(mode.totalCost)} (${inputs.passengers} pax)`
      : `${formatINR(mode.costPerPerson)} / person`;
  };

  const handlePaxChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, inputs.passengers + delta));
    onUpdateInputs({ passengers: newCount });
  };

  const handleToggleExtras = (checked: boolean) => {
    onUpdateInputs({
      expenses: {
        ...inputs.expenses,
        includeParking: checked,
        includeFood: checked,
        includeMisc: checked,
      },
    });
  };

  // Recommendation engine text
  let recommendationHeading = 'Best for 2 Travelers: Train (Express)';
  let recommendationDetail =
    'Booking 3AC saves ₹8,400 versus flying and prevents 9 hours of driver fatigue on the Western Ghats.';

  if (inputs.passengers >= 3) {
    const savingsVsBus = Math.abs(result.totalDrivingCost - busMode.totalCost);
    recommendationHeading = `Best for ${inputs.passengers} Travelers: Personal Car`;
    recommendationDetail = `With ${inputs.passengers} travelers, driving is ₹${savingsVsBus.toLocaleString(
      'en-IN'
    )} cheaper than bus and gives complete doorstep autonomy.`;
  } else if (inputs.passengers === 1) {
    recommendationHeading = 'Best for Solo Traveler: Sleeper Bus or Train';
    recommendationDetail =
      'Public transit cuts costs down to ₹900–₹1,150, saving more than 70% compared to solo driving expenses.';
  }

  return (
    <div className="flex flex-col w-full">
      {/* Visual Canvas Ambient Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 right-12 w-96 h-96 bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-80 -left-20 w-80 h-80 bg-tertiary-fixed/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md md:py-space-lg space-y-space-md md:space-y-space-lg">
          {/* ========================================== */}
          {/* 1. HEADER ASSUMPTIONS BAR                  */}
          {/* ========================================== */}
          <section className="glass-panel rounded-2xl shadow-sm p-space-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md border border-white/70">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-space-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/80 text-on-surface-variant font-label-sm text-label-sm font-semibold backdrop-blur-md shadow-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                  <span>{result.corridor ? result.corridor.viaHighway : 'Corridor Highway Estimate'}</span>
                </span>

                {/* Verified FASTag & Fuel Index Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-fixed font-label-sm text-label-sm font-semibold backdrop-blur-md shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>FASTag & State Fuel Calibrated</span>
                </span>
              </div>

              <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface flex items-center gap-space-sm tracking-tight font-bold">
                <span>{inputs.origin}</span>
                <span className="material-symbols-outlined text-primary text-[24px] md:text-[28px]">arrow_forward</span>
                <span>{inputs.destination}</span>
              </h1>

              <div className="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm flex-wrap">
                <span className="font-medium text-on-surface">
                  {inputs.isRoundTrip ? 'Round-trip (x2)' : 'One-way'}
                </span>
                <span>•</span>
                <span className="font-medium text-on-surface">
                  {inputs.passengers} {inputs.passengers === 1 ? 'traveller' : 'travellers'}
                </span>
                <span>•</span>
                <span>{result.totalDistanceKm} km driving baseline</span>
                <span>•</span>
                <span>Vehicle: {inputs.vehicle.name}</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-space-sm self-start lg:self-center shrink-0 flex-wrap">
              <button
                type="button"
                onClick={onOpenAssumptions}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-title-sm text-title-sm shadow-sm border border-surface-container active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                <span>Edit trip</span>
              </button>

              <button
                type="button"
                onClick={onSaveCurrentTrip}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all shadow-sm border active:scale-95 font-semibold text-title-sm ${
                  isTripSaved
                    ? 'bg-tertiary text-on-tertiary border-tertiary'
                    : 'bg-primary text-on-primary hover:bg-primary-container border-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isTripSaved ? 'bookmark_added' : 'bookmark_add'}
                </span>
                <span>{isTripSaved ? 'Saved in Vault' : 'Save Trip'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenShare}
                title="Export or Share Route Plan"
                className="p-2 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container transition-colors shadow-sm border border-surface-container active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </section>

          {/* Western Ghats Scenery Preview Banner */}
          <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden shadow-sm border border-surface-container">
            <img
              src="/assets/aistudio/screen_5350671f.png"
              alt="Panoramic scenic Western Ghats misty winding mountain road"
              className="w-full h-full object-cover object-center"
              onError={e => {
                // Fallback to online CDN if local asset preview is unavailable
                e.currentTarget.src =
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDT9wxL74Ar4vKw4P5mId0ZigbYgGmddNDPxB6n_FxzGtbh6BZ-tpR4P0xGMmFZTY7biCmL8UUuexy2_C2YMQM_A8cjYjGUfV32Dg60xPbtJtgUVHKto2dpUHhXK91TmPQL5UEeacNLeV9PNDDjAuATMi_xsOhcNpo6sDdRGb6HzHIgKYQ2g0PEddDCdGNrUKuF4vjxABTzCHxEoN-MGq4HzztIshVu6DZgZwLnRI5cOrEm8_S0g9d5Dg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent flex items-end justify-between p-3.5">
              <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">landscape</span>
                <span>Anmod Pass • 712m Peak Elevation • NH48 Corridor</span>
              </span>
              <span className="font-label-sm text-label-sm bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
                Dry Road • Normal Traffic Flow
              </span>
            </div>
          </div>

          {/* ========================================== */}
          {/* 2. TOP 4 METRIC HIGHLIGHT TILES            */}
          {/* ========================================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Metric 1: Lowest Group Cost */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Economy Benchmark
                  </span>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Lowest Group Cost</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">train</span> Train
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-2">
                  <span className="font-numeric-data-lg text-numeric-data-lg text-tertiary font-bold">
                    {formatINR(trainMode.totalCost)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">total door-to-door</span>
                </div>
                <p className="font-label-sm text-label-sm text-tertiary font-medium mt-1">
                  {formatINR(trainMode.costPerPerson)} / person via 3-Tier AC Sleeper
                </p>
              </div>
            </div>

            {/* Metric 2: Fastest Door-to-Door */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Transit Velocity
                  </span>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Fastest Door-to-Door</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">flight</span> Flight
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-2">
                  <span className="font-numeric-data-lg text-numeric-data-lg text-primary font-bold">
                    {flightMode.doorToDoorFormatted}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">total door-to-door</span>
                </div>
                <p className="font-label-sm text-label-sm text-secondary mt-1">
                  vs 1h 15m raw airborne (Airport transfers: 3h 15m)
                </p>
              </div>
            </div>

            {/* Metric 3: Road Trip Model */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Highway Index
                  </span>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Road Trip Model</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-[14px]">directions_car</span> Car
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-2">
                  <span className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                    {formatINR(result.totalDrivingCost)}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">total group</span>
                </div>
                <p className="font-label-sm text-label-sm text-secondary mt-1">
                  {result.fuelConsumptionUnits} {inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'} fuel + FASTag electronic tolls
                </p>
              </div>
            </div>

            {/* Metric 4: Break-Even Point */}
            <div className="glass-card-interactive rounded-2xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Tipping Point Matrix
                  </span>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Break-Even Velocity</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">groups</span> Equilibrium
                </span>
              </div>
              <div className="mt-space-md">
                <p className="font-body-md text-body-md text-on-surface font-semibold leading-snug">
                  {inputs.passengers >= result.breakEvenPassengers
                    ? `At ${inputs.passengers} travellers, driving is cheaper than bus!`
                    : `Driving breaks even at ${result.breakEvenPassengers}+ passengers (Current: ${inputs.passengers} pax)`}
                </p>
                <p className="font-label-sm text-label-sm text-secondary mt-1">
                  Fixed car cost amortizes rapidly across multiple seats
                </p>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 3. INTERACTIVE DECISION CONTROLS           */}
          {/* ========================================== */}
          <section className="bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md border border-surface-container">
            {/* Passenger Stepper & View Toggle */}
            <div className="flex flex-wrap items-center gap-space-md">
              {/* Stepper */}
              <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-[20px]">people</span>
                <span className="font-label-md text-label-md text-secondary">Travellers:</span>
                <div className="flex items-center gap-2 ml-1">
                  <button
                    type="button"
                    onClick={() => handlePaxChange(-1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-title-sm transition-colors active:scale-95"
                  >
                    -
                  </button>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface w-5 text-center font-bold">
                    {inputs.passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePaxChange(1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-bold text-title-sm transition-colors active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Group Cost vs Cost Per Person Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewPerPerson(false)}
                  className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                    !viewPerPerson
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-secondary hover:text-on-surface font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>Total Group Cost</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewPerPerson(true)}
                  className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                    viewPerPerson
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-secondary hover:text-on-surface font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  <span>Cost Per Person</span>
                </button>
              </div>
            </div>

            {/* Checkboxes: Round-trip & Extras */}
            <div className="flex flex-wrap items-center gap-space-md">
              <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface select-none">
                <input
                  type="checkbox"
                  checked={inputs.isRoundTrip}
                  onChange={e => onUpdateInputs({ isRoundTrip: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                />
                <span className="font-medium">Calculate Round-Trip (x2)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface select-none">
                <input
                  type="checkbox"
                  checked={inputs.expenses.includeParking && inputs.expenses.includeFood}
                  onChange={e => handleToggleExtras(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                />
                <span className="font-medium">Include parking & transit meals</span>
              </label>
            </div>
          </section>

          {/* ========================================== */}
          {/* 4. MAIN COMPARISON: 4 DETAILED CARDS       */}
          {/* ========================================== */}
          <section className="space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Analytical Multi-Modal Synthesis
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Which way should you travel?
                </h2>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">
                All options normalized for <strong>door-to-door</strong> timeline & expenditure
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {/* CARD 1: CAR / PERSONAL VEHICLE */}
              <div
                onClick={() => setSelectedModeId('car')}
                className={`glass-card-interactive rounded-2xl flex flex-col justify-between p-space-md relative overflow-hidden group shadow-sm transition-all cursor-pointer ${
                  selectedModeId === 'car'
                    ? 'ring-2 ring-primary border-primary bg-surface-container-lowest/90 shadow-md'
                    : 'border border-surface-container/60 hover:border-primary/50'
                }`}
              >
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">directions_car</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">Private Road Trip</h3>
                        <p className="font-label-sm text-label-sm text-secondary truncate">
                          {inputs.vehicle.name} • {carMode.doorToDoorFormatted}
                        </p>
                      </div>
                    </div>
                    {selectedModeId === 'car' ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Selected
                      </span>
                    ) : (
                      <span className="text-[11px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                        View Pie
                      </span>
                    )}
                  </div>

                  {/* Personal Car Scenic Mountain Pass Image */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform">
                    <img
                      src="/assets/aistudio/screen_5350671f.png"
                      alt="Western Ghats curved highway pass with personal car"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex items-end justify-between p-2.5">
                      <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-primary-fixed">directions_car</span>
                        <span>Western Ghats Scenic Pass</span>
                      </span>
                      <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                        Doorstep Autonomy
                      </span>
                    </div>
                  </div>

                  {/* Cost & Time Header */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low/70 backdrop-blur-sm space-y-1 border border-surface-container/50">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body-sm text-body-sm text-secondary">Door-to-door:</span>
                      <span className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                        {getModePriceDisplay(carMode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {carMode.doorToDoorFormatted}
                      </span>
                      <span className="font-semibold text-primary">{getModePriceSubtext(carMode)}</span>
                    </div>
                  </div>

                  {/* Breakdown Distribution Micro-bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>Cost Breakdown</span>
                      <span>
                        Fuel {carMode.expenseComposition[0]?.percentage}% • Tolls{' '}
                        {carMode.expenseComposition[1]?.percentage}% • Extras{' '}
                        {carMode.expenseComposition[2]?.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${carMode.expenseComposition[0]?.percentage || 71}%` }}
                        title="Fuel"
                      ></div>
                      <div
                        className="bg-on-secondary-container h-full"
                        style={{ width: `${carMode.expenseComposition[1]?.percentage || 13}%` }}
                        title="Tolls"
                      ></div>
                      <div
                        className="bg-tertiary-fixed-dim h-full"
                        style={{ width: `${carMode.expenseComposition[2]?.percentage || 16}%` }}
                        title="Food/Extras"
                      ></div>
                    </div>
                  </div>

                  {/* Itemized Elements */}
                  <div className="space-y-2 text-body-sm font-body-sm">
                    <div className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg">
                      <span className="text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-primary">local_gas_station</span>
                        <span>Fuel ({result.fuelConsumptionUnits} {inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'})</span>
                      </span>
                      <span className="font-medium text-on-surface">{formatINR(result.fuelCost)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg">
                      <span className="text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-tertiary">toll</span>
                        <span>FASTag Tolls ({result.tollPlazas.length} plazas)</span>
                      </span>
                      <span className="font-medium text-on-surface">{formatINR(result.tollCost)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg">
                      <span className="text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-secondary">local_parking</span>
                        <span>Parking & Pitstop food</span>
                      </span>
                      <span className="font-medium text-on-surface">{formatINR(result.includedExpensesTotal)}</span>
                    </div>
                  </div>

                  {/* Trade-off note */}
                  <div className="bg-surface-container-low/70 p-2.5 rounded-xl flex items-start gap-2 border border-surface-container/40">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">check_circle</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                      {carMode.tradeOffNote}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-space-md pt-space-sm">
                  <button
                    type="button"
                    onClick={onOpenBreakdown}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-title-sm text-title-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                    <span>Inspect Road-Trip Breakdown</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: INTERCITY BUS */}
              <div
                onClick={() => setSelectedModeId('bus')}
                className={`glass-card-interactive rounded-2xl flex flex-col justify-between p-space-md relative overflow-hidden group shadow-sm transition-all cursor-pointer ${
                  selectedModeId === 'bus'
                    ? 'ring-2 ring-primary border-primary bg-surface-container-lowest/90 shadow-md'
                    : 'border border-surface-container/60 hover:border-primary/50'
                }`}
              >
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">directions_bus</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">AC Sleeper Bus</h3>
                        <p className="font-label-sm text-label-sm text-secondary truncate">
                          Multi-Axle Volvo • {busMode.doorToDoorFormatted}
                        </p>
                      </div>
                    </div>
                    {selectedModeId === 'bus' && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Selected
                      </span>
                    )}
                  </div>

                  {/* Authentic AC Sleeper Bus Image */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform">
                    <img
                      src="/assets/aistudio/ac_sleeper_bus.png"
                      alt="Multi-Axle Luxury AC Sleeper Bus Volvo"
                      className="w-full h-full object-cover object-center"
                      onError={e => {
                        e.currentTarget.src =
                          'https://upload.wikimedia.org/wikipedia/commons/b/b4/KSRTC%27S_Ambaari_Dream_Class.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex items-end justify-between p-2.5">
                      <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-secondary-fixed">directions_bus</span>
                        <span>Intercity Sleeper Corridor</span>
                      </span>
                      <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                        Volvo Multi-Axle
                      </span>
                    </div>
                  </div>

                  {/* Cost & Time Header */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low/70 backdrop-blur-sm space-y-1 border border-surface-container/50">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body-sm text-body-sm text-secondary">Door-to-door:</span>
                      <span className="font-numeric-data-lg text-numeric-data-lg text-on-surface font-bold">
                        {getModePriceDisplay(busMode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {busMode.doorToDoorFormatted}
                      </span>
                      <span className="font-semibold text-on-surface">{getModePriceSubtext(busMode)}</span>
                    </div>
                  </div>

                  {/* Breakdown Distribution Micro-bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>Expense Composition</span>
                      <span>78% Tickets • 22% Autos</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                      <div className="bg-primary-container h-full" style={{ width: '78%' }} title="Bus Tickets"></div>
                      <div className="bg-secondary h-full" style={{ width: '22%' }} title="Autos"></div>
                    </div>
                  </div>

                  {/* Itemized Elements */}
                  <div className="space-y-2 text-body-sm font-body-sm">
                    {busMode.itemizedDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg"
                      >
                        <span className="text-secondary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className={`font-medium ${item.isHighlight ? 'text-tertiary font-bold' : 'text-on-surface'}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Trade-off note */}
                  <div className="bg-surface-container-low/70 p-2.5 rounded-xl flex items-start gap-2 border border-surface-container/40">
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">bed</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                      {busMode.tradeOffNote}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-space-md pt-space-sm">
                  <button
                    type="button"
                    onClick={() => onOpenBooking(busMode)}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-title-sm text-title-sm flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
                  >
                    <span>Find Bus Tickets</span>
                    <span className="material-symbols-outlined text-[16px]">north_east</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: TRAIN (BEST VALUE) */}
              <div
                onClick={() => setSelectedModeId('train')}
                className={`glass-card-interactive rounded-2xl flex flex-col justify-between p-space-md relative overflow-hidden group border-2 shadow-md transition-all cursor-pointer ${
                  selectedModeId === 'train'
                    ? 'ring-2 ring-tertiary border-tertiary bg-surface-container-lowest/90 shadow-lg'
                    : 'border-tertiary/70'
                }`}
              >
                <div className="absolute top-0 right-0 z-10 flex items-center">
                  <span className="bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold px-3 py-1 rounded-bl-xl inline-flex items-center gap-1 shadow-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">savings</span> Lowest Cost
                  </span>
                </div>

                <div className="space-y-space-md">
                  <div className="flex items-start justify-between pr-24 pt-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">train</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">Express Train</h3>
                        <p className="font-label-sm text-label-sm text-secondary truncate">
                          Konkan Route • {trainMode.doorToDoorFormatted}
                        </p>
                      </div>
                    </div>
                    {selectedModeId === 'train' && (
                      <span className="px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Selected
                      </span>
                    )}
                  </div>

                  {/* Train Photo Scenery Anchor - Placed first before pricing for symmetry */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform">
                    <img
                      src="/assets/aistudio/screen_48695467.png"
                      alt="Modern express train along scenic Western Ghats rail bridge"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src =
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuAYB0yMZTZ6zfgMBIq1VsZB1L__F9bjLsZxnKzfVlf3RIAXe1NgB23US3G-b1H3RWsYTUTzn0rV-vOZNch4SroIuccxv-Hzmza64G01QfN7HLTMZLxFvUj_fELZNTJGFOQrDKIhf9DyXHa3T7RHPl6p2f7wTT0PrKPkvE4KdwB7rya1EIRzixeF7X8Ix5HreAZBzNeGH-J1kiBOPuSNdkJQBVVFc60VjbDPXFoa1HwKRowQhZIN62ux_A';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex items-end justify-between p-2.5">
                      <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">train</span>
                        <span>Konkan Railway Viaduct</span>
                      </span>
                      <span className="text-[10px] font-semibold text-white bg-tertiary/80 backdrop-blur-md px-2 py-0.5 rounded-full">
                        Scenic Waterfalls
                      </span>
                    </div>
                  </div>

                  {/* Cost & Time Header */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low/70 backdrop-blur-sm space-y-1 border border-surface-container/50">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body-sm text-body-sm text-secondary">Door-to-door:</span>
                      <span className="font-numeric-data-lg text-numeric-data-lg text-tertiary font-bold">
                        {getModePriceDisplay(trainMode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {trainMode.doorToDoorFormatted}
                      </span>
                      <span className="font-semibold text-tertiary">{getModePriceSubtext(trainMode)}</span>
                    </div>
                  </div>

                  {/* Expense Composition Micro-bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>Expense Composition</span>
                      <span>77% Rail Fare • 23% Station Cabs</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                      <div className="bg-tertiary h-full" style={{ width: '77%' }} title="Rail Fare"></div>
                      <div className="bg-secondary h-full" style={{ width: '23%' }} title="Station Transfers"></div>
                    </div>
                  </div>

                  {/* Itemized details */}
                  <div className="space-y-2 text-body-sm font-body-sm">
                    {trainMode.itemizedDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg"
                      >
                        <span className="text-secondary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-tertiary">{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="font-medium text-on-surface">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Trade-off note */}
                  <div className="bg-tertiary-container/10 p-2.5 rounded-xl flex items-start gap-2 border border-tertiary/20">
                    <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">info</span>
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                      {trainMode.tradeOffNote}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-space-md pt-space-sm">
                  <button
                    type="button"
                    onClick={() => onOpenBooking(trainMode)}
                    className="w-full py-2.5 px-3 rounded-xl bg-tertiary text-on-tertiary font-title-sm text-title-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-[0.99] hover:bg-tertiary/90 font-semibold"
                  >
                    <span>Check Train Availability</span>
                    <span className="material-symbols-outlined text-[16px]">north_east</span>
                  </button>
                </div>
              </div>

              {/* CARD 4: FLIGHT (FASTEST) */}
              <div
                onClick={() => setSelectedModeId('flight')}
                className={`glass-card-interactive rounded-2xl flex flex-col justify-between p-space-md relative overflow-hidden group border-2 shadow-md transition-all cursor-pointer ${
                  selectedModeId === 'flight'
                    ? 'ring-2 ring-primary border-primary bg-surface-container-lowest/90 shadow-lg'
                    : 'border-primary/70'
                }`}
              >
                <div className="absolute top-0 right-0 z-10">
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm font-bold px-3 py-1 rounded-bl-xl inline-flex items-center gap-1 shadow-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[13px]">bolt</span> Fastest
                  </span>
                </div>

                <div className="space-y-space-md">
                  <div className="flex items-start justify-between pr-20 pt-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">Flight</h3>
                        <p className="font-label-sm text-label-sm text-secondary truncate">
                          Direct Flight • {flightMode.doorToDoorFormatted}
                        </p>
                      </div>
                    </div>
                    {selectedModeId === 'flight' && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Selected
                      </span>
                    )}
                  </div>

                  {/* Flight Wing Photo */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform">
                    <img
                      src="/assets/aistudio/screen_0f0752d3.png"
                      alt="Airplane wing flying over fluffy golden clouds"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src =
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVrz45cHOy8o6GAFFvAeIgSJdaFW_HTm4cmyK2vIgMEWY8lAY5McT6lq4uz1zjVYyLtYq-d95Nbv22sskXFJitKWnDH6ZGHTNuMFlZmnit3eM0dVj1QgqGaQE8t6ZDhOM2ICLtKyRK_PTexK8UykTezumpCAZdZKAG5A49oCWozKEQDGebU9OQtOdy3csD9jYakTSH28Z554zh7NbFjKRZwCm3aGuW86WHM9UAYflpDWPtwKz7f6qA';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex items-end justify-between p-2.5">
                      <span className="font-label-sm text-label-sm text-surface-bright flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[15px] text-primary-fixed">flight</span>
                        <span>Air Corridor Horizon</span>
                      </span>
                      <span className="text-[10px] font-semibold text-white bg-primary/80 backdrop-blur-md px-2 py-0.5 rounded-full">
                        Fastest Airborne
                      </span>
                    </div>
                  </div>

                  {/* Cost & Time Header */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low/70 backdrop-blur-sm space-y-1 border border-surface-container/50">
                    <div className="flex items-baseline justify-between">
                      <span className="font-body-sm text-body-sm text-secondary">Door-to-door:</span>
                      <span className="font-numeric-data-lg text-numeric-data-lg text-primary font-bold">
                        {getModePriceDisplay(flightMode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        {flightMode.doorToDoorFormatted}
                      </span>
                      <span className="font-semibold text-secondary">{getModePriceSubtext(flightMode)}</span>
                    </div>
                  </div>

                  {/* Expense Composition Micro-bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>Expense Composition</span>
                      <span>74% Airfare • 26% Airport Cabs</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: '74%' }} title="Airfare"></div>
                      <div className="bg-error h-full" style={{ width: '26%' }} title="Airport Transfers"></div>
                    </div>
                  </div>

                  {/* Itemized details */}
                  <div className="space-y-2 text-body-sm font-body-sm">
                    {flightMode.itemizedDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 bg-surface-container-low/50 px-2 rounded-lg"
                      >
                        <span className="text-secondary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-outline">{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className={`font-medium ${item.isHighlight ? 'text-error font-bold' : 'text-on-surface'}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Warning Callout */}
                  <div className="bg-error-container/20 p-2.5 rounded-xl flex items-start gap-2 text-on-surface border border-error/30">
                    <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">warning</span>
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                      {flightMode.cautionaryNote}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-space-md pt-space-sm">
                  <button
                    type="button"
                    onClick={() => onOpenBooking(flightMode)}
                    className="w-full py-2.5 px-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-title-sm text-title-sm flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99] shadow-sm font-semibold"
                  >
                    <span>Search Flights</span>
                    <span className="material-symbols-outlined text-[16px]">north_east</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* 4.5 RECHARTS VISUAL COST PIE BREAKDOWN     */}
          {/* ========================================== */}
          <section id="trip-cost-pie-breakdown" className="w-full">
            <TripCostPieChart
              inputs={inputs}
              result={result}
              viewPerPerson={viewPerPerson}
              onOpenBreakdown={onOpenBreakdown}
              selectedModeId={selectedModeId}
              onSelectModeId={setSelectedModeId}
            />
          </section>

          {/* ========================================== */}
          {/* 5. DETAILED COMPARISON MATRIX              */}
          {/* ========================================== */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between flex-wrap gap-2 border-b border-surface-container">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Comparative Feature Matrix
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  Rigorous side-by-side breakdown across core logistical vectors.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                Dataset updated 2 hours ago
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm font-body-sm">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-title-sm text-title-sm">
                    <th className="p-4 w-1/4">Evaluation Attribute</th>
                    <th className="p-4 w-[18.75%] text-on-surface">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-primary">directions_car</span>
                        <span>Car (Personal)</span>
                      </div>
                    </th>
                    <th className="p-4 w-[18.75%] text-on-surface">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-primary">directions_bus</span>
                        <span>Intercity Bus</span>
                      </div>
                    </th>
                    <th className="p-4 w-[18.75%] text-on-surface">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">train</span>
                        <span>Train (Express)</span>
                      </div>
                    </th>
                    <th className="p-4 w-[18.75%] text-on-surface">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-primary">flight</span>
                        <span>Flight (Economy)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40">
                  {/* Total Group Cost */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-title-sm text-title-sm text-on-surface font-semibold">Total Group Cost</td>
                    <td className="p-4 font-numeric-data-md text-numeric-data-md text-on-surface font-bold">
                      {formatINR(carMode.totalCost)}
                    </td>
                    <td className="p-4 font-numeric-data-md text-numeric-data-md text-on-surface font-bold">
                      {formatINR(busMode.totalCost)}
                    </td>
                    <td className="p-4 font-numeric-data-md text-numeric-data-md text-tertiary font-bold">
                      {formatINR(trainMode.totalCost)}
                    </td>
                    <td className="p-4 font-numeric-data-md text-numeric-data-md text-on-surface font-bold">
                      {formatINR(flightMode.totalCost)}
                    </td>
                  </tr>

                  {/* Cost per Person */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-medium text-secondary">Cost per Person</td>
                    <td className="p-4 text-on-surface font-medium">{formatINR(carMode.costPerPerson)}</td>
                    <td className="p-4 text-on-surface font-medium">{formatINR(busMode.costPerPerson)}</td>
                    <td className="p-4 text-tertiary font-bold">{formatINR(trainMode.costPerPerson)}</td>
                    <td className="p-4 text-on-surface font-medium">{formatINR(flightMode.costPerPerson)}</td>
                  </tr>

                  {/* Door-to-Door Duration */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-title-sm text-title-sm text-on-surface font-semibold">Door-to-Door Duration</td>
                    <td className="p-4 text-on-surface">{carMode.doorToDoorFormatted}</td>
                    <td className="p-4 text-on-surface">{busMode.doorToDoorFormatted}</td>
                    <td className="p-4 text-on-surface">{trainMode.doorToDoorFormatted}</td>
                    <td className="p-4 text-primary font-bold">{flightMode.doorToDoorFormatted}</td>
                  </tr>

                  {/* In-Transit Time */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-secondary">Active In-Transit Time</td>
                    <td className="p-4 text-on-surface">{carMode.inTransitFormatted}</td>
                    <td className="p-4 text-on-surface">{busMode.inTransitFormatted}</td>
                    <td className="p-4 text-on-surface">{trainMode.inTransitFormatted}</td>
                    <td className="p-4 text-on-surface font-medium">{flightMode.inTransitFormatted}</td>
                  </tr>

                  {/* Terminal Access & Transfers */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-secondary">Terminal Access & Transfers</td>
                    <td className="p-4 text-on-surface">{carMode.terminalAccessFormatted}</td>
                    <td className="p-4 text-on-surface">{busMode.terminalAccessFormatted}</td>
                    <td className="p-4 text-on-surface">{trainMode.terminalAccessFormatted}</td>
                    <td className="p-4 text-error font-semibold">{flightMode.terminalAccessFormatted}</td>
                  </tr>

                  {/* Waiting / Check-in */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-secondary">Waiting / Security Buffers</td>
                    <td className="p-4 text-on-surface">{carMode.waitingBufferFormatted}</td>
                    <td className="p-4 text-on-surface">{busMode.waitingBufferFormatted}</td>
                    <td className="p-4 text-on-surface">{trainMode.waitingBufferFormatted}</td>
                    <td className="p-4 text-error font-semibold">{flightMode.waitingBufferFormatted}</td>
                  </tr>

                  {/* Luggage Capability */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-secondary">Luggage Capability</td>
                    <td className="p-4 text-tertiary font-semibold">{carMode.luggageCapability}</td>
                    <td className="p-4 text-on-surface">{busMode.luggageCapability}</td>
                    <td className="p-4 text-on-surface">{trainMode.luggageCapability}</td>
                    <td className="p-4 text-secondary">{flightMode.luggageCapability}</td>
                  </tr>

                  {/* Flexibility */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-secondary">Flexibility & Stops</td>
                    <td className="p-4 text-tertiary font-semibold">High (Stop anywhere)</td>
                    <td className="p-4 text-secondary">Low (Preset rest-stops)</td>
                    <td className="p-4 text-secondary">Moderate (Fixed schedule)</td>
                    <td className="p-4 text-secondary">Very Low (Inflexible flights)</td>
                  </tr>

                  {/* Confidence */}
                  <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-low/30">
                    <td className="p-4 text-secondary font-medium">Data Confidence Index</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-tertiary font-semibold">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> 98% (Live Fuel API)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-tertiary font-semibold">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> 94% (Partner Feeds)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-tertiary font-semibold">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> 99% (Static IRCTC)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">
                        <span className="w-2 h-2 rounded-full bg-primary"></span> 91% (Dynamic Fare API)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================== */}
          {/* 6. TRANSPARENT CALCULATION BREAKDOWN       */}
          {/* ========================================== */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container">
            <button
              type="button"
              onClick={() => setShowFormulas(!showFormulas)}
              className="w-full p-space-md flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">function</span>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    How RouteWise calculated these estimates
                  </h4>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Mathematical transparent models, zero black-box assumptions.
                  </p>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-secondary transition-transform duration-200 ${
                  showFormulas ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {showFormulas && (
              <div className="p-space-md bg-surface-container-low space-y-space-md border-t border-surface-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl space-y-2 border border-surface-container">
                    <h5 className="font-title-sm text-title-sm text-primary flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[16px]">local_gas_station</span>
                      <span>Vehicle Fuel & Toll Equation</span>
                    </h5>
                    <div className="font-label-md text-label-md bg-surface-container p-2.5 rounded-lg font-mono text-on-surface">
                      Total_Car = (Distance ÷ EffectiveMileage × FuelPrice) + Sum(FASTagTolls) + Extras
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Current trip:{' '}
                      <code>
                        ({result.totalDistanceKm} km ÷ {result.effectiveMileage} km/L × ₹{inputs.vehicle.fuelPrice}) + ₹
                        {result.tollCost} tolls + ₹{result.includedExpensesTotal} extras = {formatINR(result.totalDrivingCost)}
                      </code>
                      .
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl space-y-2 border border-surface-container">
                    <h5 className="font-title-sm text-title-sm text-primary flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[16px]">flight</span>
                      <span>Aviation Ground Tax Reality Factor</span>
                    </h5>
                    <div className="font-label-md text-label-md bg-surface-container p-2.5 rounded-lg font-mono text-on-surface">
                      Total_Flight = (BaseFare × N) + Cab(Origin → Airport) + Cab(Airport → FinalDestination)
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Flight airtime (1h 15m) neglects the 120-minute security buffer and 35 km transit from Mopa
                      Airport to Central Goa (typically ₹2,000 via prepaid GoaMiles).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================== */}
          {/* 7. GEOSPATIAL TELEMETRY & RECOMMENDATION   */}
          {/* ========================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
            {/* Elevation Profile Card */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm p-space-md space-y-space-md border border-surface-container flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                    Geospatial Telemetry
                  </span>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">
                    Pune-Goa Corridor Profile & Ghats
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-label-sm font-label-sm text-on-surface-variant font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span>NH48 via Nipani-Amboli Pass</span>
                </div>
              </div>

              {/* Map & Elevation Sparkline */}
              <div className="w-full h-44 rounded-xl bg-surface-container relative overflow-hidden shadow-inner border border-surface-container">
                <img
                  src="/assets/aistudio/screen_bbc9e229.png"
                  alt="Satellite topographic elevation map of rugged green mountain range"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src =
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCL7QwGp2kvCFnx5yeGqWSxkli3isYHk5UpH33uuF0lLGZo83X1BHoBoMJCVd5_t2686qYOhSYllh8aAUZ0HTn3-RcV6uJvym_9CUeGrP_MZCm6TFW2yrUIHRAgHpRzqctt89v2wWLQA93Pkaoa-sQcixFXV5GGuK8Mk884g6ip-yElbX_k4yBPY68xv7rhKZEud7WrWUO9rH6jingovKnxgwu1yhkcP5L2Y9HE6xWeER2sTwyQW1OsMQ';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between text-surface-bright font-label-sm text-label-sm">
                    <span>Deccan Plateau (560m)</span>
                    <span className="font-bold text-tertiary-fixed">Peak: 712m (Anmod)</span>
                    <span>Coastal Plain (14m)</span>
                  </div>
                  {/* SVG Elevation Sparkline */}
                  <svg className="w-full h-7 mt-1 text-primary-fixed stroke-current" fill="none" viewBox="0 0 320 40">
                    <path
                      d="M0,25 Q40,24 80,20 T160,5 T220,12 T280,36 L320,38"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    ></path>
                    <circle cx="160" cy="5" fill="#315cf5" r="3.5"></circle>
                  </svg>
                </div>
              </div>

              {/* Metric Triplets */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-surface-container-low p-2 rounded-xl">
                  <span className="font-label-sm text-label-sm text-secondary block">Max Gradient</span>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">8.4%</span>
                </div>
                <div className="bg-surface-container-low p-2 rounded-xl">
                  <span className="font-label-sm text-label-sm text-secondary block">Toll Plazas</span>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">4 Plazas</span>
                </div>
                <div className="bg-surface-container-low p-2 rounded-xl">
                  <span className="font-label-sm text-label-sm text-secondary block">Avg Ghat Speed</span>
                  <span className="font-numeric-data-md text-numeric-data-md text-on-surface font-bold">54.2 km/h</span>
                </div>
              </div>
            </div>

            {/* Recommendation Engine Box */}
            <div className="bg-primary text-on-primary rounded-2xl shadow-xl p-space-lg flex flex-col justify-between space-y-space-md relative overflow-hidden">
              <div className="space-y-space-sm relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-label-sm text-label-sm font-bold tracking-wide uppercase">
                  Recommendation Engine
                </span>
                <h3 className="font-headline-sm text-headline-sm text-white font-bold leading-tight">
                  {recommendationHeading}
                </h3>
                <p className="font-body-md text-body-md text-primary-fixed leading-relaxed">
                  {recommendationDetail}
                </p>
              </div>

              <div className="space-y-space-sm relative z-10 pt-2">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={onSaveCurrentTrip}
                    className={`flex-1 py-3 px-4 rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 font-bold ${
                      isTripSaved
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-white text-primary hover:bg-surface-container-lowest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isTripSaved ? 'bookmark_added' : 'bookmark_add'}
                    </span>
                    <span>{isTripSaved ? 'Saved in Vault' : 'Save Trip to Vault'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenShare}
                    className="py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-title-sm text-title-sm flex items-center justify-center gap-2 transition-all active:scale-95 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    <span>Share Summary</span>
                  </button>
                </div>
                <p className="font-label-sm text-label-sm text-center text-primary-fixed/80">
                  RouteWise alerts you if airfare drops below train threshold.
                </p>
              </div>

              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
