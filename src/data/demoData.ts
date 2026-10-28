import { CorridorRoute, VehicleProfile, TollPlaza } from '../types/index.ts';

export const DEFAULT_VEHICLES: VehicleProfile[] = [
  {
    id: 'veh-sedan-petrol',
    name: 'Sedan (Petrol)',
    fuelType: 'petrol',
    mileage: 15.0,
    mileageUnit: 'km/L',
    fuelPrice: 105.0,
    fuelPriceUnit: '₹/L',
    vehicleClass: 'Sedan',
    terrainAdjustment: 1.0,
  },
  {
    id: 'veh-hatch-petrol',
    name: 'Petrol Hatchback',
    fuelType: 'petrol',
    mileage: 16.5,
    mileageUnit: 'km/L',
    fuelPrice: 105.0,
    fuelPriceUnit: '₹/L',
    vehicleClass: 'Hatchback',
    terrainAdjustment: 1.0,
  },
  {
    id: 'veh-suv-diesel',
    name: 'Diesel SUV',
    fuelType: 'diesel',
    mileage: 13.5,
    mileageUnit: 'km/L',
    fuelPrice: 92.5,
    fuelPriceUnit: '₹/L',
    vehicleClass: 'SUV',
    terrainAdjustment: 1.0,
  },
  {
    id: 'veh-cng-compact',
    name: 'CNG Compact',
    fuelType: 'cng',
    mileage: 22.0,
    mileageUnit: 'km/kg',
    fuelPrice: 85.0,
    fuelPriceUnit: '₹/kg',
    vehicleClass: 'Compact',
    terrainAdjustment: 1.0,
  },
  {
    id: 'veh-ev-crossover',
    name: 'Electric EV Crossover',
    fuelType: 'electric',
    mileage: 6.5,
    mileageUnit: 'km/kWh',
    fuelPrice: 9.0,
    fuelPriceUnit: '₹/kWh',
    vehicleClass: 'EV',
    terrainAdjustment: 1.0,
  },
];

export const PUNE_GOA_TOLLS: TollPlaza[] = [
  {
    id: 'toll-khed',
    name: 'Khed-Shivapur Plaza',
    location: 'NH48 (Pune - Satara)',
    nhHighway: 'NH48',
    carToll: 120,
    fastagAccepted: true,
  },
  {
    id: 'toll-anewadi',
    name: 'Anewadi Plaza',
    location: 'NH48 (Satara - Karad)',
    nhHighway: 'NH48',
    carToll: 90,
    fastagAccepted: true,
  },
  {
    id: 'toll-taswade',
    name: 'Taswade Plaza',
    location: 'NH48 (Karad - Kolhapur)',
    nhHighway: 'NH48',
    carToll: 105,
    fastagAccepted: true,
  },
  {
    id: 'toll-kini',
    name: 'Kini Plaza',
    location: 'NH48 (Kolhapur bypass)',
    nhHighway: 'NH48',
    carToll: 100,
    fastagAccepted: true,
  },
  {
    id: 'toll-goa-entry',
    name: 'Goa Border Toll & Green Cess',
    location: 'Patradevi / Chorla Entry Gate',
    nhHighway: 'SH1 / NH748',
    carToll: 185,
    fastagAccepted: true,
  },
];

export const POPULAR_CORRIDORS: CorridorRoute[] = [
  {
    id: 'pune-goa',
    origin: 'Pune, MH',
    destination: 'Goa, GA',
    distanceKm: 450,
    drivingTimeMinutes: 570, // 9h 30m
    viaHighway: 'NH48 / AH47 via Anmod Ghat',
    popularName: 'Pune ➔ Goa Coastline',
    scenicPass: 'Anmod Pass • 712m Peak Elevation',
    peakElevation: 712,
    elevationProfile: [
      { label: 'Deccan Plateau (Pune)', elevationMeters: 560, distanceKm: 0 },
      { label: 'Satara Valley', elevationMeters: 670, distanceKm: 110 },
      { label: 'Kolhapur Basin', elevationMeters: 570, distanceKm: 230 },
      { label: 'Anmod Pass Crest', elevationMeters: 712, distanceKm: 340 },
      { label: 'Goa Coastal Plain', elevationMeters: 14, distanceKm: 450 },
    ],
    stateSegments: [
      { stateName: 'Maharashtra', stateCode: 'MH', distanceKm: 375, sampleFuelPrice: 105.8 },
      { stateName: 'Goa', stateCode: 'GA', distanceKm: 75, sampleFuelPrice: 96.5 },
    ],
    tollPlazas: PUNE_GOA_TOLLS,
    defaultTollTotal: 600,
    defaultTransitCosts: {
      busFareSingle: 900,
      busTransferFixed: 500,
      busMinutes: 660, // 11h
      trainFareSingle: 700,
      trainTransferFixed: 400,
      trainMinutes: 690, // 11h 30m
      flightAirfareSingle: 3800,
      flightTransferFixed: 2600,
      flightMinutes: 270, // 4h 30m
    },
  },
  {
    id: 'mumbai-pune',
    origin: 'Mumbai, Maharashtra',
    destination: 'Pune, Maharashtra',
    distanceKm: 148,
    drivingTimeMinutes: 180, // 3h
    viaHighway: 'Mumbai-Pune Expressway',
    popularName: 'Mumbai ➔ Pune Expressway',
    scenicPass: 'Khandala / Bhor Ghat',
    peakElevation: 580,
    elevationProfile: [
      { label: 'Mumbai Sea Level', elevationMeters: 10, distanceKm: 0 },
      { label: 'Khandala Ghat Crest', elevationMeters: 580, distanceKm: 80 },
      { label: 'Pune Plateau', elevationMeters: 560, distanceKm: 148 },
    ],
    tollPlazas: [
      {
        id: 'toll-expressway',
        name: 'Khalapur & Talegaon Combined',
        location: 'Mumbai-Pune Expressway',
        nhHighway: 'Expressway',
        carToll: 320,
        fastagAccepted: true,
      },
    ],
    defaultTollTotal: 320,
    defaultTransitCosts: {
      busFareSingle: 450,
      busTransferFixed: 200,
      busMinutes: 240, // 4h
      trainFareSingle: 190,
      trainTransferFixed: 200,
      trainMinutes: 210, // 3h 30m
      flightAirfareSingle: 3200,
      flightTransferFixed: 1800,
      flightMinutes: 240, // 4h door-to-door
    },
  },
  {
    id: 'delhi-jaipur',
    origin: 'Delhi, NCR',
    destination: 'Jaipur, Rajasthan',
    distanceKm: 281,
    drivingTimeMinutes: 270, // 4h 30m
    viaHighway: 'Delhi-Mumbai Expressway Spur / NH48',
    popularName: 'Delhi ➔ Jaipur Corridor',
    scenicPass: 'Aravalli Range foothills',
    peakElevation: 430,
    elevationProfile: [
      { label: 'Delhi Basin', elevationMeters: 215, distanceKm: 0 },
      { label: 'Gurugram Ridge', elevationMeters: 235, distanceKm: 35 },
      { label: 'Kotputli Plain', elevationMeters: 310, distanceKm: 140 },
      { label: 'Jaipur Valley', elevationMeters: 430, distanceKm: 281 },
    ],
    stateSegments: [
      { stateName: 'Haryana', stateCode: 'HR', distanceKm: 85, sampleFuelPrice: 97.3 },
      { stateName: 'Rajasthan', stateCode: 'RJ', distanceKm: 196, sampleFuelPrice: 104.8 },
    ],
    defaultTollTotal: 460,
    defaultTransitCosts: {
      busFareSingle: 650,
      busTransferFixed: 300,
      busMinutes: 330,
      trainFareSingle: 575,
      trainTransferFixed: 250,
      trainMinutes: 230, // Vande Bharat
      flightAirfareSingle: 2800,
      flightTransferFixed: 1600,
      flightMinutes: 210,
    },
  },
  {
    id: 'bengaluru-chennai',
    origin: 'Bengaluru, Karnataka',
    destination: 'Chennai, Tamil Nadu',
    distanceKm: 346,
    drivingTimeMinutes: 360, // 6h
    viaHighway: 'NH48 via Hosur & Kanchipuram',
    popularName: 'Bengaluru ➔ Chennai Expressway',
    scenicPass: 'Eastern Ghats descent',
    peakElevation: 920,
    elevationProfile: [
      { label: 'Bengaluru Plateau', elevationMeters: 920, distanceKm: 0 },
      { label: 'Krishnagiri Foothills', elevationMeters: 480, distanceKm: 90 },
      { label: 'Vellore Valley', elevationMeters: 216, distanceKm: 210 },
      { label: 'Chennai Coastline', elevationMeters: 6, distanceKm: 346 },
    ],
    stateSegments: [
      { stateName: 'Karnataka', stateCode: 'KA', distanceKm: 42, sampleFuelPrice: 102.8 },
      { stateName: 'Tamil Nadu', stateCode: 'TN', distanceKm: 304, sampleFuelPrice: 100.7 },
    ],
    defaultTollTotal: 490,
    defaultTransitCosts: {
      busFareSingle: 750,
      busTransferFixed: 350,
      busMinutes: 420,
      trainFareSingle: 490,
      trainTransferFixed: 300,
      trainMinutes: 270, // Shatabdi
      flightAirfareSingle: 2600,
      flightTransferFixed: 1800,
      flightMinutes: 220,
    },
  },
];

export const SAMPLE_CITIES = [
  'Pune, Maharashtra',
  'Goa, India',
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Jaipur, Rajasthan',
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Chandigarh, Punjab',
  'Kochi, Kerala',
];
