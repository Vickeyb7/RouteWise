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
  IntermediateStop,
  RouteLeg,
  OptimizedRouteSequenceResult,
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

/**
 * Normalizes an intermediate stop input (string or object) into a canonical IntermediateStop object.
 */
export function normalizeIntermediateStop(
  stop: string | IntermediateStop,
  index: number = 0
): IntermediateStop {
  if (typeof stop === 'string') {
    const trimmed = stop.trim();
    return {
      id: `stop-${index}-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '') || index}`,
      name: trimmed,
      stopDurationMinutes: 30,
    };
  }
  return {
    ...stop,
    id: stop.id || `stop-${index}-${stop.name.toLowerCase().replace(/[^a-z0-9]/g, '') || index}`,
    name: stop.name || `Waypoint ${index + 1}`,
    stopDurationMinutes: stop.stopDurationMinutes ?? 30,
  };
}

/**
 * Normalizes an array of intermediate stops (mix of strings and objects)
 */
export function normalizeIntermediateStops(
  stops: (string | IntermediateStop)[] | undefined
): IntermediateStop[] {
  if (!Array.isArray(stops)) return [];
  return stops.map((s, idx) => normalizeIntermediateStop(s, idx));
}

/**
 * Dynamically reorders intermediate stops by moving an item from one index to another.
 */
export function reorderIntermediateStops(
  stops: (string | IntermediateStop)[],
  fromIndex: number,
  toIndex: number
): IntermediateStop[] {
  const normalized = normalizeIntermediateStops(stops);
  if (
    fromIndex < 0 ||
    fromIndex >= normalized.length ||
    toIndex < 0 ||
    toIndex >= normalized.length ||
    fromIndex === toIndex
  ) {
    return normalized;
  }
  const result = [...normalized];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Database of coordinates for common transit hubs, cities, and popular waypoints across Indian corridors.
 */
export const KNOWN_TRANSIT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Maharashtra & Goa corridor (NH48 / NH66 / AH47)
  pune: { lat: 18.5204, lng: 73.8567 },
  'pune, mh': { lat: 18.5204, lng: 73.8567 },
  'pune, maharashtra': { lat: 18.5204, lng: 73.8567 },
  satara: { lat: 17.6805, lng: 74.0183 },
  karad: { lat: 17.2891, lng: 74.1814 },
  kolhapur: { lat: 16.705, lng: 74.2433 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  belagavi: { lat: 15.8497, lng: 74.4977 },
  anmod: { lat: 15.4373, lng: 74.3724 },
  goa: { lat: 15.4909, lng: 73.8278 },
  'goa, ga': { lat: 15.4909, lng: 73.8278 },
  'goa, india': { lat: 15.4909, lng: 73.8278 },
  panaji: { lat: 15.4909, lng: 73.8278 },
  madgaon: { lat: 15.2832, lng: 73.9862 },
  margao: { lat: 15.2832, lng: 73.9862 },
  vasco: { lat: 15.3995, lng: 73.8124 },
  mapusa: { lat: 15.5937, lng: 73.8142 },

  // Mumbai - Pune corridor
  mumbai: { lat: 19.076, lng: 72.8777 },
  'mumbai, maharashtra': { lat: 19.076, lng: 72.8777 },
  navi_mumbai: { lat: 19.033, lng: 73.0297 },
  lonavala: { lat: 18.7557, lng: 73.4091 },
  khandala: { lat: 18.7614, lng: 73.3768 },
  panvel: { lat: 18.9894, lng: 73.1175 },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586 },
  panchgani: { lat: 17.9234, lng: 73.8016 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  shirdi: { lat: 19.7645, lng: 74.4762 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  chhatrapati_sambhajinagar: { lat: 19.8762, lng: 75.3433 },

  // Delhi - Jaipur - NCR corridor
  delhi: { lat: 28.7041, lng: 77.1025 },
  'delhi, ncr': { lat: 28.7041, lng: 77.1025 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  neemrana: { lat: 27.9893, lng: 76.3861 },
  kotputli: { lat: 27.7032, lng: 76.2001 },
  shahpura: { lat: 27.3878, lng: 75.9592 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  'jaipur, rajasthan': { lat: 26.9124, lng: 75.7873 },
  agra: { lat: 27.1767, lng: 78.0081 },
  mathura: { lat: 27.4924, lng: 77.6737 },

  // Bengaluru - Chennai - South corridor
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  'bengaluru, karnataka': { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hosur: { lat: 12.7409, lng: 77.8253 },
  krishnagiri: { lat: 12.5186, lng: 78.2137 },
  vellore: { lat: 12.9165, lng: 79.1325 },
  kanchipuram: { lat: 12.8342, lng: 79.7036 },
  sriperumbudur: { lat: 12.9692, lng: 79.9452 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  'chennai, tamil nadu': { lat: 13.0827, lng: 80.2707 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  coorg: { lat: 12.3375, lng: 75.8069 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
};

/**
 * Resolves approximate geographical coordinates from a place name or stop object.
 */
export function resolveLocationCoordinates(
  nameOrStop: string | IntermediateStop
): { lat: number; lng: number } {
  if (typeof nameOrStop === 'object' && nameOrStop.lat !== undefined && nameOrStop.lng !== undefined) {
    return { lat: nameOrStop.lat, lng: nameOrStop.lng };
  }

  const rawName = typeof nameOrStop === 'string' ? nameOrStop : nameOrStop.name;
  const normalized = rawName.toLowerCase().trim().replace(/[.,]/g, '');

  // Exact match
  if (KNOWN_TRANSIT_COORDINATES[normalized]) {
    return KNOWN_TRANSIT_COORDINATES[normalized];
  }

  // Substring match
  const matchKey = Object.keys(KNOWN_TRANSIT_COORDINATES).find(
    k => normalized.includes(k) || k.includes(normalized)
  );
  if (matchKey) {
    return KNOWN_TRANSIT_COORDINATES[matchKey];
  }

  // Deterministic pseudo-coordinates based on string hash for unknown locations
  let hash = 0;
  for (let i = 0; i < rawName.length; i++) {
    hash = (hash << 5) - hash + rawName.charCodeAt(i);
    hash |= 0;
  }
  const latSpread = 15.0 + Math.abs(hash % 12000) / 1000; // Between 15°N and 27°N
  const lngSpread = 73.0 + Math.abs((hash >> 4) % 9000) / 1000; // Between 73°E and 82°E
  return { lat: latSpread, lng: lngSpread };
}

/**
 * Haversine distance between two coordinates in kilometers, multiplied by a highway winding factor
 * (typically 1.25x - 1.35x for Indian national highways / expressway detours).
 */
export function calculatePointDistanceKm(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  highwayWindingFactor: number = 1.28
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  if (straightLine < 1) return 5; // Minimal city hop
  return Math.round(straightLine * highwayWindingFactor * 10) / 10;
}

/**
 * Helper to compute distance and travel time for a single route leg.
 */
function calculateRouteLeg(
  fromName: string,
  toName: string,
  fromCoords: { lat: number; lng: number },
  toCoords: { lat: number; lng: number },
  averageSpeedKmh: number = 55
): RouteLeg {
  const dist = calculatePointDistanceKm(fromCoords, toCoords);
  const transitHours = dist / Math.max(20, averageSpeedKmh);
  const travelTimeMinutes = Math.max(5, Math.round(transitHours * 60));

  return {
    from: fromName,
    to: toName,
    distanceKm: dist,
    travelTimeMinutes,
    speedKmh: averageSpeedKmh,
  };
}

/**
 * Evaluates the full journey cost (distance & time) for a given sequence of stops:
 * Origin -> Stop[0] -> Stop[1] -> ... -> Stop[n-1] -> Destination
 */
function evaluateRouteSequence(
  originName: string,
  originCoords: { lat: number; lng: number },
  stops: IntermediateStop[],
  destName: string,
  destCoords: { lat: number; lng: number },
  averageSpeedKmh: number = 55
): {
  totalDistanceKm: number;
  totalTransitTimeMinutes: number;
  totalDurationWithStopsMinutes: number;
  legs: RouteLeg[];
} {
  const legs: RouteLeg[] = [];
  let totalDistanceKm = 0;
  let totalTransitTimeMinutes = 0;
  let totalStopDwellMinutes = 0;

  let currentName = originName;
  let currentCoords = originCoords;

  for (const stop of stops) {
    const stopCoords = resolveLocationCoordinates(stop);
    const leg = calculateRouteLeg(currentName, stop.name, currentCoords, stopCoords, averageSpeedKmh);
    legs.push(leg);
    totalDistanceKm += leg.distanceKm;
    totalTransitTimeMinutes += leg.travelTimeMinutes;
    totalStopDwellMinutes += stop.stopDurationMinutes || 30;

    currentName = stop.name;
    currentCoords = stopCoords;
  }

  // Final leg to destination
  const finalLeg = calculateRouteLeg(currentName, destName, currentCoords, destCoords, averageSpeedKmh);
  legs.push(finalLeg);
  totalDistanceKm += finalLeg.distanceKm;
  totalTransitTimeMinutes += finalLeg.travelTimeMinutes;

  return {
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTransitTimeMinutes,
    totalDurationWithStopsMinutes: totalTransitTimeMinutes + totalStopDwellMinutes,
    legs,
  };
}

/**
 * Calculates the most time-efficient route sequence (TSP solver with fixed endpoints).
 * Minimizes total driving transit time and road distance starting at Origin,
 * visiting all intermediate stops, and terminating at Destination.
 *
 * For <= 8 stops: Exact exhaustive permutation evaluation.
 * For > 8 stops: Fast 2-opt heuristic optimization.
 */
export function calculateTimeEfficientRouteSequence(
  origin: string,
  intermediateStops: (string | IntermediateStop)[],
  destination: string,
  options?: {
    averageSpeedKmh?: number;
    defaultStopDurationMinutes?: number;
  }
): OptimizedRouteSequenceResult {
  const originName = origin.trim() || 'Origin';
  const destName = destination.trim() || 'Destination';
  const avgSpeed = options?.averageSpeedKmh ?? 58; // 58 km/h typical average on Indian highways
  const stops = normalizeIntermediateStops(intermediateStops);

  const originCoords = resolveLocationCoordinates(originName);
  const destCoords = resolveLocationCoordinates(destName);

  // 1. Evaluate original (user-entered) sequence baseline
  const originalEvaluation = evaluateRouteSequence(
    originName,
    originCoords,
    stops,
    destName,
    destCoords,
    avgSpeed
  );

  // If 0 or 1 stops, ordering is already trivial
  if (stops.length <= 1) {
    return {
      origin: originName,
      destination: destName,
      originalSequence: [...stops],
      optimizedSequence: [...stops],
      totalDistanceKm: originalEvaluation.totalDistanceKm,
      totalTransitTimeMinutes: originalEvaluation.totalTransitTimeMinutes,
      totalDurationWithStopsMinutes: originalEvaluation.totalDurationWithStopsMinutes,
      originalDistanceKm: originalEvaluation.totalDistanceKm,
      originalTransitTimeMinutes: originalEvaluation.totalTransitTimeMinutes,
      distanceSavedKm: 0,
      timeSavedMinutes: 0,
      isReordered: false,
      legs: originalEvaluation.legs,
    };
  }

  let bestSequence: IntermediateStop[] = [...stops];
  let bestTransitTime = originalEvaluation.totalTransitTimeMinutes;
  let bestDistance = originalEvaluation.totalDistanceKm;
  let bestEvaluation = originalEvaluation;

  // Exact TSP Permutations for small stop counts (<= 8 stops)
  if (stops.length <= 8) {
    const generatePermutations = (arr: IntermediateStop[]): IntermediateStop[][] => {
      if (arr.length <= 1) return [arr];
      const permutations: IntermediateStop[][] = [];
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        const subPerms = generatePermutations(remaining);
        for (const sub of subPerms) {
          permutations.push([current, ...sub]);
        }
      }
      return permutations;
    };

    const allPermutations = generatePermutations(stops);
    for (const perm of allPermutations) {
      const evaluation = evaluateRouteSequence(
        originName,
        originCoords,
        perm,
        destName,
        destCoords,
        avgSpeed
      );

      // We optimize primarily for minimum transit time (and secondary for distance)
      if (
        evaluation.totalTransitTimeMinutes < bestTransitTime ||
        (evaluation.totalTransitTimeMinutes === bestTransitTime && evaluation.totalDistanceKm < bestDistance)
      ) {
        bestTransitTime = evaluation.totalTransitTimeMinutes;
        bestDistance = evaluation.totalDistanceKm;
        bestSequence = perm;
        bestEvaluation = evaluation;
      }
    }
  } else {
    // 2-Opt heuristic for larger lists of stops
    let improved = true;
    let currentSeq = [...stops];
    let currentEval = originalEvaluation;

    while (improved) {
      improved = false;
      for (let i = 0; i < currentSeq.length - 1; i++) {
        for (let k = i + 1; k < currentSeq.length; k++) {
          // Reverse sub-sequence between i and k
          const candidateSeq = [
            ...currentSeq.slice(0, i),
            ...currentSeq.slice(i, k + 1).reverse(),
            ...currentSeq.slice(k + 1),
          ];

          const candidateEval = evaluateRouteSequence(
            originName,
            originCoords,
            candidateSeq,
            destName,
            destCoords,
            avgSpeed
          );

          if (candidateEval.totalTransitTimeMinutes < currentEval.totalTransitTimeMinutes) {
            currentSeq = candidateSeq;
            currentEval = candidateEval;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
    bestSequence = currentSeq;
    bestEvaluation = currentEval;
  }

  // Check if sequence actually changed
  const isReordered =
    bestSequence.some((stop, idx) => stop.id !== stops[idx]?.id || stop.name !== stops[idx]?.name);

  const timeSavedMinutes = Math.max(0, originalEvaluation.totalTransitTimeMinutes - bestEvaluation.totalTransitTimeMinutes);
  const distanceSavedKm = Math.max(0, Math.round((originalEvaluation.totalDistanceKm - bestEvaluation.totalDistanceKm) * 10) / 10);

  return {
    origin: originName,
    destination: destName,
    originalSequence: [...stops],
    optimizedSequence: bestSequence,
    totalDistanceKm: bestEvaluation.totalDistanceKm,
    totalTransitTimeMinutes: bestEvaluation.totalTransitTimeMinutes,
    totalDurationWithStopsMinutes: bestEvaluation.totalDurationWithStopsMinutes,
    originalDistanceKm: originalEvaluation.totalDistanceKm,
    originalTransitTimeMinutes: originalEvaluation.totalTransitTimeMinutes,
    distanceSavedKm,
    timeSavedMinutes,
    isReordered,
    legs: bestEvaluation.legs,
  };
}

