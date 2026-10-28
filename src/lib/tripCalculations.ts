/**
 * RouteWise Core Calculation Engine
 * Single source of truth for all modal cost calculations and door-to-door transit intelligence.
 */

import {
  TripInputs,
  TripCalculationResult,
  TransportModeEstimate,
  StateFuelSegment,
  CorridorRoute,
} from '../types/index.ts';
import { POPULAR_CORRIDORS } from '../data/demoData.ts';

/**
 * Currency formatter for Indian Rupees (₹) with Indian digit grouping (e.g., ₹1,800, ₹10,200)
 */
export function formatINR(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '₹0';
  const rounded = Math.round(val);
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Format duration in minutes into a human-readable string like "9 h 30 min" or "45 min"
 */
export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0 min';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} h`;
  return `${hrs} h ${mins.toString().padStart(2, '0')} min`;
}

/**
 * Find matched corridor or compute sensible distance based on origin/destination
 */
export function matchCorridor(origin: string, destination: string): CorridorRoute | undefined {
  const normO = origin.toLowerCase().trim();
  const normD = destination.toLowerCase().trim();

  return POPULAR_CORRIDORS.find(c => {
    const cO = c.origin.toLowerCase();
    const cD = c.destination.toLowerCase();
    return (
      (normO.includes('pune') && normD.includes('goa')) ||
      (normO.includes('goa') && normD.includes('pune')) ||
      (cO.includes(normO) && cD.includes(normD)) ||
      (normO.includes('mumbai') && normD.includes('pune')) ||
      (normO.includes('delhi') && normD.includes('jaipur')) ||
      (normO.includes('bengaluru') && normD.includes('chennai'))
    );
  });
}

/**
 * Sanitize and validate trip inputs
 */
export function sanitizeInputs(inputs: TripInputs): {
  passengers: number;
  distanceKm: number;
  mileage: number;
  fuelPrice: number;
  terrainFactor: number;
  tripMultiplier: number;
  matchedCorridor?: CorridorRoute;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Passengers
  let passengers = Math.max(1, Math.floor(inputs.passengers || 1));
  if (passengers > 20) {
    passengers = 20;
    warnings.push('Passenger count capped at 20.');
  }

  // Corridor & distance
  const matchedCorridor = matchCorridor(inputs.origin, inputs.destination);
  let oneWayDistance = matchedCorridor ? matchedCorridor.distanceKm : 450;

  // Mileage
  let mileage = inputs.vehicle.mileage;
  if (!mileage || mileage <= 0 || isNaN(mileage)) {
    mileage = 15.0;
    warnings.push('Invalid mileage detected; reverted to baseline 15.0 km/L.');
  }

  // Fuel price
  let fuelPrice = inputs.vehicle.fuelPrice;
  if (fuelPrice < 0 || isNaN(fuelPrice)) {
    fuelPrice = 105.0;
    warnings.push('Invalid fuel price detected; reverted to default ₹105.00.');
  }

  // Terrain factor
  const terrainFactor = Math.max(0.7, Math.min(1.3, inputs.vehicle.terrainAdjustment || 1.0));

  // Round trip
  const tripMultiplier = inputs.isRoundTrip ? 2 : 1;

  return {
    passengers,
    distanceKm: oneWayDistance,
    mileage,
    fuelPrice,
    terrainFactor,
    tripMultiplier,
    matchedCorridor,
    warnings,
  };
}

/**
 * Main calculation engine
 */
export function calculateTripCosts(inputs: TripInputs): TripCalculationResult {
  const {
    passengers,
    distanceKm: oneWayDistance,
    mileage,
    fuelPrice,
    terrainFactor,
    tripMultiplier,
    matchedCorridor,
    warnings,
  } = sanitizeInputs(inputs);

  const totalDistance = oneWayDistance * tripMultiplier;
  const effectiveMileage = mileage * terrainFactor;

  // 1. Fuel calculations
  // Exact formula: fuelUnits = totalDistance / effectiveMileage
  const fuelConsumptionUnits = totalDistance / effectiveMileage;
  const fuelCost = fuelConsumptionUnits * fuelPrice;

  // 2. State-wise fuel segments calculation
  let stateSegments: StateFuelSegment[] = [];
  if (matchedCorridor?.stateSegments && matchedCorridor.stateSegments.length > 0) {
    stateSegments = matchedCorridor.stateSegments.map(seg => {
      const segDistance = seg.distanceKm * tripMultiplier;
      const segConsumed = segDistance / effectiveMileage;
      const segPrice = seg.sampleFuelPrice;
      const segCost = segConsumed * segPrice;
      return {
        stateName: seg.stateName,
        stateCode: seg.stateCode,
        distanceKm: segDistance,
        fuelPricePerUnit: segPrice,
        fuelConsumed: Math.round(segConsumed * 10) / 10,
        cost: Math.round(segCost),
      };
    });
  } else {
    stateSegments = [
      {
        stateName: 'State Highway Corridor',
        stateCode: 'IN',
        distanceKm: totalDistance,
        fuelPricePerUnit: fuelPrice,
        fuelConsumed: Math.round(fuelConsumptionUnits * 10) / 10,
        cost: Math.round(fuelCost),
      },
    ];
  }

  // 3. Toll calculations
  let tollCost = 0;
  const tollPlazas = matchedCorridor?.tollPlazas || [];
  if (inputs.useManualToll) {
    tollCost = Math.max(0, inputs.customTolls || 0);
  } else {
    // Default toll total
    const baseToll = matchedCorridor?.defaultTollTotal ?? 600;
    // Round trip often gets return concession on FASTag (e.g., 25% off return within 24h, or 2x)
    tollCost = inputs.isRoundTrip ? Math.round(baseToll * 1.85) : baseToll;
  }

  // 4. Included additional expenses
  let includedExpensesTotal = 0;
  if (inputs.expenses.includeParking) includedExpensesTotal += inputs.expenses.parking;
  if (inputs.expenses.includeFood) includedExpensesTotal += inputs.expenses.food;
  if (inputs.expenses.includeAccommodation) includedExpensesTotal += inputs.expenses.accommodation;
  if (inputs.expenses.includeMisc) includedExpensesTotal += inputs.expenses.misc;

  // Round trip multiplier on daily expenses like food & parking
  if (inputs.isRoundTrip) {
    includedExpensesTotal *= 1.8;
  }
  includedExpensesTotal = Math.round(includedExpensesTotal);

  // 5. Total driving cost
  const totalDrivingCost = Math.round(fuelCost + tollCost + includedExpensesTotal);
  const carCostPerPerson = Math.round(totalDrivingCost / passengers);

  // 6. Public transit defaults calibrated by route and passenger count
  const transitDefaults = matchedCorridor?.defaultTransitCosts || {
    busFareSingle: 900,
    busTransferFixed: 500,
    busMinutes: 660,
    trainFareSingle: 700,
    trainTransferFixed: 400,
    trainMinutes: 690,
    flightAirfareSingle: 3800,
    flightTransferFixed: 2600,
    flightMinutes: 270,
  };

  const transitMultiplier = inputs.isRoundTrip ? 1.95 : 1.0;
  const cabTransfersNeeded = Math.ceil(passengers / 4); // Cabs hold up to 4 passengers

  // BUS ESTIMATE
  const busTicketsTotal = Math.round(transitDefaults.busFareSingle * passengers * (inputs.isRoundTrip ? 2 : 1));
  const busTransfers = Math.round(transitDefaults.busTransferFixed * cabTransfersNeeded * (inputs.isRoundTrip ? 2 : 1));
  const busTotalCost = busTicketsTotal + busTransfers;
  const busCostPerPerson = Math.round(busTotalCost / passengers);

  // TRAIN ESTIMATE
  const trainTicketsTotal = Math.round(transitDefaults.trainFareSingle * passengers * (inputs.isRoundTrip ? 2 : 1));
  const trainTransfers = Math.round(transitDefaults.trainTransferFixed * cabTransfersNeeded * (inputs.isRoundTrip ? 2 : 1));
  const trainTotalCost = trainTicketsTotal + trainTransfers;
  const trainCostPerPerson = Math.round(trainTotalCost / passengers);

  // FLIGHT ESTIMATE
  const flightAirfareTotal = Math.round(transitDefaults.flightAirfareSingle * passengers * (inputs.isRoundTrip ? 1.95 : 1));
  const flightAirportCabs = Math.round(transitDefaults.flightTransferFixed * cabTransfersNeeded * (inputs.isRoundTrip ? 2 : 1));
  const flightTotalCost = flightAirfareTotal + flightAirportCabs;
  const flightCostPerPerson = Math.round(flightTotalCost / passengers);

  // 7. Door-to-door times
  // Car: in-vehicle time + break time (approx 30m break per 4h)
  const baseDriveMinutes = (matchedCorridor?.drivingTimeMinutes || 540) * tripMultiplier;
  const drivingBreaks = Math.floor(baseDriveMinutes / 240) * 30;
  const carDoorToDoor = baseDriveMinutes + drivingBreaks;

  // Bus: inTransit (expressway) + terminal transfers + boarding buffer
  const busInTransit = Math.round(transitDefaults.busMinutes * 0.85 * tripMultiplier);
  const busTransfersTime = 70 * tripMultiplier;
  const busWaitBuffer = 20 * tripMultiplier;
  const busDoorToDoor = busInTransit + busTransfersTime + busWaitBuffer;

  // Train: rail line time + station cabs + platform buffer
  const trainInTransit = Math.round(transitDefaults.trainMinutes * 0.85 * tripMultiplier);
  const trainTransfersTime = 80 * tripMultiplier;
  const trainWaitBuffer = 30 * tripMultiplier;
  const trainDoorToDoor = trainInTransit + trainTransfersTime + trainWaitBuffer;

  // Flight: airborne flight time + airport cabs + checkin/security buffer
  const flightAirborne = 75 * tripMultiplier;
  const flightTransfersTime = 75 * tripMultiplier;
  const flightSecurityWait = 120 * tripMultiplier;
  const flightDoorToDoor = flightAirborne + flightTransfersTime + flightSecurityWait;

  // Calculate percentage splits for Car
  const fuelPct = Math.round((fuelCost / totalDrivingCost) * 100) || 71;
  const tollPct = Math.round((tollCost / totalDrivingCost) * 100) || 13;
  const miscPct = Math.max(0, 100 - fuelPct - tollPct);

  // 8. Assemble Modes
  const modes: TransportModeEstimate[] = [
    {
      id: 'car',
      title: 'Private Road Trip',
      subtitle: `${inputs.vehicle.name} • ${formatDuration(carDoorToDoor)}`,
      modeType: 'Private Vehicle',
      icon: 'directions_car',
      totalCost: totalDrivingCost,
      costPerPerson: carCostPerPerson,
      doorToDoorMinutes: carDoorToDoor,
      doorToDoorFormatted: formatDuration(carDoorToDoor),
      inTransitMinutes: baseDriveMinutes,
      inTransitFormatted: `${formatDuration(baseDriveMinutes)} (Driving)`,
      terminalAccessMinutes: 0,
      terminalAccessFormatted: '0 min (Doorstep delivery)',
      waitingBufferMinutes: drivingBreaks,
      waitingBufferFormatted: `${drivingBreaks} min (Voluntary pitstops)`,
      expenseComposition: [
        { label: 'Fuel', amount: Math.round(fuelCost), percentage: fuelPct, colorClass: 'bg-primary' },
        { label: 'Tolls', amount: Math.round(tollCost), percentage: tollPct, colorClass: 'bg-on-secondary-container' },
        { label: 'Food & Extras', amount: includedExpensesTotal, percentage: miscPct, colorClass: 'bg-tertiary-fixed-dim' },
      ],
      itemizedDetails: [
        {
          label: `Fuel (${fuelConsumptionUnits.toFixed(1)} ${inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'} @ ₹${fuelPrice}/${inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'})`,
          amount: formatINR(fuelCost),
          icon: 'local_gas_station',
        },
        {
          label: `Tolls (FASTag electronic gates)`,
          amount: formatINR(tollCost),
          icon: 'toll',
        },
        {
          label: `Included extras (Parking, food)`,
          amount: formatINR(includedExpensesTotal),
          icon: 'local_parking',
        },
      ],
      tradeOffNote: 'Complete door-to-door schedule flexibility, luggage included, stop anytime at scenic vista points.',
      cautionaryNote: 'Ghat curves require attentive driving; driver fatigue on 8+ hour routes.',
      luggageCapability: 'Unlimited (Boot capacity)',
      flexibilityScore: 'High',
      confidenceIndex: 98,
      ctaText: 'Inspect Road-Trip Breakdown',
      ctaAction: 'inspect_breakdown',
    },
    {
      id: 'bus',
      title: 'AC Sleeper Bus',
      subtitle: `Multi-Axle Intercity • ${formatDuration(busDoorToDoor)}`,
      modeType: 'Intercity Bus',
      icon: 'directions_bus',
      totalCost: busTotalCost,
      costPerPerson: busCostPerPerson,
      doorToDoorMinutes: busDoorToDoor,
      doorToDoorFormatted: formatDuration(busDoorToDoor),
      inTransitMinutes: busInTransit,
      inTransitFormatted: `${formatDuration(busInTransit)} (Highway)`,
      terminalAccessMinutes: busTransfersTime,
      terminalAccessFormatted: `${formatDuration(busTransfersTime)} (Local autos/cabs)`,
      waitingBufferMinutes: busWaitBuffer,
      waitingBufferFormatted: `${busWaitBuffer} min (Boarding point)`,
      expenseComposition: [
        {
          label: 'Bus Tickets',
          amount: busTicketsTotal,
          percentage: Math.round((busTicketsTotal / busTotalCost) * 100),
          colorClass: 'bg-primary-container',
        },
        {
          label: 'Terminal Transfers',
          amount: busTransfers,
          percentage: Math.max(1, 100 - Math.round((busTicketsTotal / busTotalCost) * 100)),
          colorClass: 'bg-secondary',
        },
      ],
      itemizedDetails: [
        {
          label: `Bus tickets (${passengers} berth${passengers > 1 ? 's' : ''})`,
          amount: formatINR(busTicketsTotal),
          icon: 'confirmation_number',
        },
        {
          label: 'Origin/Destination local transfers',
          amount: formatINR(busTransfers),
          icon: 'local_taxi',
        },
        {
          label: 'Hotel night saved',
          amount: '-₹1,200 net',
          icon: 'bedtime',
          isHighlight: true,
        },
      ],
      tradeOffNote: 'Overnight journey saves 1 night hotel expense; sleep en route without driving stress.',
      cautionaryNote: 'Fixed boarding spots; Ghat hairpins at night can induce motion sickness.',
      luggageCapability: '2 x 20kg bags per passenger',
      flexibilityScore: 'Low',
      confidenceIndex: 94,
      ctaText: 'Find Bus Tickets',
      ctaAction: 'book_bus',
    },
    {
      id: 'train',
      title: 'Express / Vande Bharat',
      subtitle: `Konkan Railway • ${formatDuration(trainDoorToDoor)}`,
      modeType: 'Train / Railway',
      icon: 'train',
      totalCost: trainTotalCost,
      costPerPerson: trainCostPerPerson,
      doorToDoorMinutes: trainDoorToDoor,
      doorToDoorFormatted: formatDuration(trainDoorToDoor),
      inTransitMinutes: trainInTransit,
      inTransitFormatted: `${formatDuration(trainInTransit)} (Rail line)`,
      terminalAccessMinutes: trainTransfersTime,
      terminalAccessFormatted: `${formatDuration(trainTransfersTime)} (Station cabs)`,
      waitingBufferMinutes: trainWaitBuffer,
      waitingBufferFormatted: `${trainWaitBuffer} min (Platform buffer)`,
      expenseComposition: [
        {
          label: 'Train Tickets',
          amount: trainTicketsTotal,
          percentage: Math.round((trainTicketsTotal / trainTotalCost) * 100),
          colorClass: 'bg-tertiary',
        },
        {
          label: 'Station Cabs',
          amount: trainTransfers,
          percentage: Math.max(1, 100 - Math.round((trainTicketsTotal / trainTotalCost) * 100)),
          colorClass: 'bg-secondary',
        },
      ],
      itemizedDetails: [
        {
          label: `3AC / CC Class tickets (${passengers} pax)`,
          amount: formatINR(trainTicketsTotal),
          icon: 'confirmation_number',
        },
        {
          label: 'Station arrival & departure taxis',
          amount: formatINR(trainTransfers),
          icon: 'local_taxi',
        },
        {
          label: 'Scenic Western Ghats route',
          amount: 'Included',
          icon: 'photo_camera',
          isHighlight: true,
        },
      ],
      tradeOffNote: 'Most scenic views through tunnels & waterfalls with supreme budget efficiency.',
      cautionaryNote: 'High waitlists on Konkan/IRCTC; requires booking 3+ weeks early.',
      luggageCapability: 'High (Up to 40kg per pax)',
      flexibilityScore: 'Moderate',
      confidenceIndex: 99,
      ctaText: 'Check Train Availability',
      ctaAction: 'book_train',
      badge: {
        text: 'Lowest Cost',
        type: 'best-value',
      },
    },
    {
      id: 'flight',
      title: 'Flight (Economy Jet)',
      subtitle: `Direct Flight • ${formatDuration(flightDoorToDoor)} Total`,
      modeType: 'Commercial Aviation',
      icon: 'flight_takeoff',
      totalCost: flightTotalCost,
      costPerPerson: flightCostPerPerson,
      doorToDoorMinutes: flightDoorToDoor,
      doorToDoorFormatted: formatDuration(flightDoorToDoor),
      inTransitMinutes: flightAirborne,
      inTransitFormatted: `${formatDuration(flightAirborne)} (Airborne)`,
      terminalAccessMinutes: flightTransfersTime,
      terminalAccessFormatted: `${formatDuration(flightTransfersTime)} (Airport cabs)`,
      waitingBufferMinutes: flightSecurityWait,
      waitingBufferFormatted: `${flightSecurityWait} min (Check-in & TSA)`,
      expenseComposition: [
        {
          label: 'Base Airfare',
          amount: flightAirfareTotal,
          percentage: Math.round((flightAirfareTotal / flightTotalCost) * 100),
          colorClass: 'bg-primary',
        },
        {
          label: 'Airport Cabs',
          amount: flightAirportCabs,
          percentage: Math.max(1, 100 - Math.round((flightAirfareTotal / flightTotalCost) * 100)),
          colorClass: 'bg-error',
        },
      ],
      itemizedDetails: [
        {
          label: `Base airfare (${passengers} pax)`,
          amount: formatINR(flightAirfareTotal),
          icon: 'flight',
        },
        {
          label: `Airport cabs (${cabTransfersNeeded} cab${cabTransfersNeeded > 1 ? 's' : ''} origin + dest)`,
          amount: formatINR(flightAirportCabs),
          icon: 'local_taxi',
          isHighlight: true,
        },
        {
          label: 'Security & baggage reclaim wait',
          amount: '2 h 00 min',
          icon: 'hourglass_empty',
        },
      ],
      tradeOffNote: 'Arrive in less than half the driving time; frees an entire working day.',
      cautionaryNote: 'Door-to-door calculation includes 2h security buffer + airport taxi surcharge (adds ~34% over ticket).',
      luggageCapability: 'Strict (15kg check-in + 7kg cabin)',
      flexibilityScore: 'Very Low',
      confidenceIndex: 91,
      ctaText: 'Search Flights',
      ctaAction: 'book_flight',
      badge: {
        text: 'Fastest',
        type: 'fastest',
      },
    },
  ];

  // Identify cheapest & fastest
  const sortedByCost = [...modes].sort((a, b) => a.totalCost - b.totalCost);
  const sortedByTime = [...modes].sort((a, b) => a.doorToDoorMinutes - b.doorToDoorMinutes);

  const cheapestModeId = sortedByCost[0].id;
  const fastestModeId = sortedByTime[0].id;

  // Calculate break-even passenger count for car vs bus
  // Car cost is fixed (totalDrivingCost); Bus cost is busFareSingle * P + busTransfer
  let breakEvenPassengers = 3;
  for (let p = 1; p <= 10; p++) {
    const busCostP = transitDefaults.busFareSingle * p + transitDefaults.busTransferFixed;
    if (totalDrivingCost <= busCostP) {
      breakEvenPassengers = p;
      break;
    }
  }

  return {
    oneWayDistanceKm: oneWayDistance,
    totalDistanceKm: totalDistance,
    effectiveMileage,
    fuelConsumptionUnits: Math.round(fuelConsumptionUnits * 10) / 10,
    fuelCost: Math.round(fuelCost),
    tollCost,
    tollPlazas,
    includedExpensesTotal,
    totalDrivingCost,
    costPerPerson: carCostPerPerson,
    stateSegments,
    modes,
    cheapestModeId,
    fastestModeId,
    breakEvenPassengers,
    corridor: matchedCorridor,
    isDemoData: true,
    warnings,
  };
}
