/**
 * RouteWise Data Types & Domain Models
 */

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric';

export type MileageUnit = 'km/L' | 'km/kg' | 'km/kWh';
export type FuelPriceUnit = '₹/L' | '₹/kg' | '₹/kWh';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export interface VehicleProfile {
  id: string;
  name: string;
  fuelType: FuelType;
  mileage: number; // in unit specified by mileageUnit
  mileageUnit: MileageUnit;
  fuelPrice: number; // in ₹ per unit
  fuelPriceUnit: FuelPriceUnit;
  vehicleClass: string; // 'Hatchback' | 'Sedan' | 'SUV' | 'Compact' | 'EV'
  terrainAdjustment: number; // 1.0 default, 0.9 for uphill/ghats (consumes more), 1.1 for pure highway
}

export interface TripExpenses {
  parking: number;
  food: number;
  accommodation: number;
  misc: number;
  includeParking: boolean;
  includeFood: boolean;
  includeAccommodation: boolean;
  includeMisc: boolean;
}

export interface TollPlaza {
  id: string;
  name: string;
  location: string;
  nhHighway: string;
  carToll: number;
  fastagAccepted: boolean;
}

export interface StateFuelSegment {
  stateName: string;
  stateCode: string;
  distanceKm: number;
  fuelPricePerUnit: number;
  fuelConsumed: number;
  cost: number;
}

export interface ElevationPoint {
  label: string;
  elevationMeters: number;
  distanceKm: number;
}

export interface CorridorRoute {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  drivingTimeMinutes: number;
  viaHighway: string;
  popularName: string;
  scenicPass?: string;
  peakElevation?: number;
  elevationProfile?: ElevationPoint[];
  stateSegments?: { stateName: string; stateCode: string; distanceKm: number; sampleFuelPrice: number }[];
  tollPlazas?: TollPlaza[];
  defaultTollTotal: number;
  defaultTransitCosts?: {
    busFareSingle: number;
    busTransferFixed: number;
    busMinutes: number;
    trainFareSingle: number;
    trainTransferFixed: number;
    trainMinutes: number;
    flightAirfareSingle: number;
    flightTransferFixed: number;
    flightMinutes: number;
  };
}

export interface TripInputs {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  isRoundTrip: boolean;
  passengers: number;
  intermediateStops: string[];
  vehicle: VehicleProfile;
  expenses: TripExpenses;
  customTolls?: number;
  useManualToll: boolean;
}

export interface ModeExpenseComposition {
  label: string;
  amount: number;
  percentage: number;
  colorClass: string;
}

export interface ModeItemizedDetail {
  label: string;
  amount: number | string;
  icon: string;
  note?: string;
  isHighlight?: boolean;
}

export interface TransportModeEstimate {
  id: 'car' | 'bus' | 'train' | 'flight';
  title: string;
  subtitle: string;
  modeType: string;
  icon: string;
  totalCost: number;
  costPerPerson: number;
  doorToDoorMinutes: number;
  doorToDoorFormatted: string;
  inTransitMinutes: number;
  inTransitFormatted: string;
  terminalAccessMinutes: number;
  terminalAccessFormatted: string;
  waitingBufferMinutes: number;
  waitingBufferFormatted: string;
  expenseComposition: ModeExpenseComposition[];
  itemizedDetails: ModeItemizedDetail[];
  tradeOffNote: string;
  cautionaryNote?: string;
  luggageCapability: string;
  flexibilityScore: 'High' | 'Moderate' | 'Low' | 'Very Low';
  confidenceIndex: number;
  ctaText: string;
  ctaAction: 'inspect_breakdown' | 'book_bus' | 'book_train' | 'book_flight';
  badge?: {
    text: string;
    type: 'best-value' | 'fastest' | 'optimal';
  };
}

export interface TripCalculationResult {
  oneWayDistanceKm: number;
  totalDistanceKm: number;
  effectiveMileage: number;
  fuelConsumptionUnits: number;
  fuelCost: number;
  tollCost: number;
  tollPlazas: TollPlaza[];
  includedExpensesTotal: number;
  totalDrivingCost: number;
  costPerPerson: number;
  stateSegments: StateFuelSegment[];
  modes: TransportModeEstimate[];
  cheapestModeId: 'car' | 'bus' | 'train' | 'flight';
  fastestModeId: 'car' | 'bus' | 'train' | 'flight';
  breakEvenPassengers: number;
  corridor?: CorridorRoute;
  isDemoData: boolean;
  warnings: string[];
}

export interface SavedTrip {
  id: string;
  title: string;
  createdAt: string;
  inputs: TripInputs;
  summary: {
    totalCarCost: number;
    costPerPerson: number;
    distanceKm: number;
    passengers: number;
    bestMode: string;
  };
}
