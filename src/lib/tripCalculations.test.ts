/**
 * RouteWise Calculation Engine Regression & Verification Tests
 */

import { calculateTripCosts, sanitizeInputs, formatINR, formatDuration } from './tripCalculations.ts';
import { TripInputs, VehicleProfile } from '../types/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ ${message}`);
}

const puneGoaVehicle: VehicleProfile = {
  id: 'veh-test-pune-goa',
  name: 'Sedan (Petrol)',
  fuelType: 'petrol',
  mileage: 15.0,
  mileageUnit: 'km/L',
  fuelPrice: 105.0,
  fuelPriceUnit: '₹/L',
  vehicleClass: 'Sedan',
  terrainAdjustment: 1.0,
};

const puneGoaInputs: TripInputs = {
  origin: 'Pune, MH',
  destination: 'Goa, GA',
  departureDate: '2025-10-18',
  isRoundTrip: false,
  passengers: 2,
  intermediateStops: [],
  vehicle: puneGoaVehicle,
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
  useManualToll: true,
};

console.log('--- RUNNING ROUTEWISE REGRESSION TESTS ---');

// Test 1: Pune to Goa Regression Baseline
const result1 = calculateTripCosts(puneGoaInputs);

assert(result1.oneWayDistanceKm === 450, `Distance should be 450 km (got ${result1.oneWayDistanceKm})`);
assert(result1.fuelConsumptionUnits === 30, `Fuel consumption should be 30 L (got ${result1.fuelConsumptionUnits})`);
assert(result1.fuelCost === 3150, `Fuel cost should be ₹3,150 (got ${result1.fuelCost})`);
assert(result1.tollCost === 600, `Toll cost should be ₹600 (got ${result1.tollCost})`);
assert(result1.includedExpensesTotal === 700, `Included expenses should be ₹700 (got ${result1.includedExpensesTotal})`);
assert(result1.totalDrivingCost === 4450, `Total driving cost should be ₹4,450 (got ${result1.totalDrivingCost})`);
assert(result1.costPerPerson === 2225, `Cost per person for 2 pax should be ₹2,225 (got ${result1.costPerPerson})`);

// Test 2: Multimodal comparison check
const carMode = result1.modes.find(m => m.id === 'car')!;
const busMode = result1.modes.find(m => m.id === 'bus')!;
const trainMode = result1.modes.find(m => m.id === 'train')!;
const flightMode = result1.modes.find(m => m.id === 'flight')!;

assert(carMode.totalCost === 4450, `Car total cost should be ₹4,450`);
assert(carMode.costPerPerson === 2225, `Car per-person should be ₹2,225`);
assert(busMode.totalCost === 2300, `Bus total cost should be ₹2,300 (got ${busMode.totalCost})`);
assert(busMode.costPerPerson === 1150, `Bus per-person should be ₹1,150 (got ${busMode.costPerPerson})`);
assert(trainMode.totalCost === 1800, `Train total cost should be ₹1,800 (got ${trainMode.totalCost})`);
assert(trainMode.costPerPerson === 900, `Train per-person should be ₹900 (got ${trainMode.costPerPerson})`);
assert(flightMode.totalCost === 10200, `Flight total cost should be ₹10,200 (got ${flightMode.totalCost})`);
assert(flightMode.costPerPerson === 5100, `Flight per-person should be ₹5,100 (got ${flightMode.costPerPerson})`);

// Test 3: Cheapest & Fastest identifiers
assert(result1.cheapestModeId === 'train', `Cheapest mode should be train (got ${result1.cheapestModeId})`);
assert(result1.fastestModeId === 'flight', `Fastest mode should be flight (got ${result1.fastestModeId})`);

// Test 4: Passenger Count Scaling
const inputs4Pax: TripInputs = { ...puneGoaInputs, passengers: 4 };
const result4Pax = calculateTripCosts(inputs4Pax);
assert(result4Pax.totalDrivingCost === 4450, 'Car total cost remains fixed at ₹4,450 for 4 pax');
assert(result4Pax.costPerPerson === Math.round(4450 / 4), 'Car per-person amortizes down to ₹1,113');
const bus4 = result4Pax.modes.find(m => m.id === 'bus')!;
assert(bus4.totalCost === 900 * 4 + 500, `Bus total for 4 pax should be ₹4,100 (got ${bus4.totalCost})`);

// Test 5: CNG Units Handling
const cngVehicle: VehicleProfile = {
  ...puneGoaVehicle,
  fuelType: 'cng',
  mileage: 25.0,
  mileageUnit: 'km/kg',
  fuelPrice: 80.0,
  fuelPriceUnit: '₹/kg',
};
const resultCNG = calculateTripCosts({ ...puneGoaInputs, vehicle: cngVehicle });
assert(resultCNG.fuelConsumptionUnits === 18, `CNG consumed should be 18 kg (got ${resultCNG.fuelConsumptionUnits})`);
assert(resultCNG.fuelCost === 18 * 80, `CNG cost should be ₹1,440 (got ${resultCNG.fuelCost})`);

// Test 6: Round Trip Handling
const resultRound = calculateTripCosts({ ...puneGoaInputs, isRoundTrip: true });
assert(resultRound.totalDistanceKm === 900, `Round trip distance should be 900 km (got ${resultRound.totalDistanceKm})`);
assert(resultRound.fuelCost === 3150 * 2, `Round trip fuel cost should be 2x ₹3,150 = ₹6,300`);

// Test 7: Zero or negative inputs safety
const unsafeInputs: TripInputs = {
  ...puneGoaInputs,
  passengers: 0,
  vehicle: { ...puneGoaVehicle, mileage: 0, fuelPrice: -50 },
};
const safe = sanitizeInputs(unsafeInputs);
assert(safe.passengers === 1, 'Zero passengers sanitized to 1');
assert(safe.mileage === 15, 'Zero mileage sanitized to fallback 15');
assert(safe.fuelPrice === 105, 'Negative fuel price sanitized to fallback 105');

// Test 8: Formatters
assert(formatINR(4450) === '₹4,450', 'formatINR formats ₹4,450 properly');
assert(formatDuration(570) === '9 h 30 min', 'formatDuration formats 570 mins as 9 h 30 min');

console.log('--- ALL REGRESSION TESTS PASSED SUCCESSFULLY! ---');
