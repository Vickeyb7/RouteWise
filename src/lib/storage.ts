/**
 * LocalStorage Persistence Layer for RouteWise
 * Safely persists Saved Trips, Vehicles, and Scenario drafts with versioning & error recovery.
 */

import { SavedTrip, VehicleProfile, TripInputs, UserProfile } from '../types/index.ts';
import { DEFAULT_VEHICLES } from '../data/demoData.ts';

const STORAGE_KEYS = {
  SAVED_TRIPS: 'routewise_saved_trips_v1',
  SAVED_VEHICLES: 'routewise_saved_vehicles_v1',
  CURRENT_TRIP: 'routewise_current_trip_v1',
  ACTIVE_VEHICLE_ID: 'routewise_active_vehicle_id_v1',
  USER_PROFILE: 'routewise_user_profile_v1',
};

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse user profile from storage:', e);
    return null;
  }
}

export function saveUserProfile(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save user profile to localStorage:', e);
  }
}

export function loadSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove any auto-generated seed trips so only trips explicitly saved by the user appear
      return parsed.filter(t => t.id !== 'trip-pune-goa-seed');
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse saved trips from storage, returning empty list:', e);
    return [];
  }
}

export function saveTrip(trip: SavedTrip): SavedTrip[] {
  const trips = loadSavedTrips().filter(t => t.id !== trip.id);
  trips.unshift(trip);
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trip to localStorage:', e);
  }
  return trips;
}

export function deleteSavedTrip(id: string): SavedTrip[] {
  const trips = loadSavedTrips().filter(t => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to update trips in localStorage:', e);
  }
  return trips;
}

export function loadSavedVehicles(): VehicleProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_VEHICLES);
    if (!raw) {
      // Initialize with default vehicles
      saveVehicles(DEFAULT_VEHICLES);
      return DEFAULT_VEHICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_VEHICLES;
  } catch (e) {
    console.warn('Failed to load vehicles from storage, returning defaults:', e);
    return DEFAULT_VEHICLES;
  }
}

export function saveVehicles(vehicles: VehicleProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_VEHICLES, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Failed to save vehicles to localStorage:', e);
  }
}

export function saveVehicle(vehicle: VehicleProfile): VehicleProfile[] {
  const current = loadSavedVehicles();
  const existingIndex = current.findIndex(v => v.id === vehicle.id);
  let updated: VehicleProfile[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = vehicle;
  } else {
    updated = [vehicle, ...current];
  }
  saveVehicles(updated);
  return updated;
}

export function deleteVehicle(id: string): VehicleProfile[] {
  const current = loadSavedVehicles();
  // Don't delete if only 1 vehicle left
  if (current.length <= 1) return current;
  const filtered = current.filter(v => v.id !== id);
  saveVehicles(filtered);
  return filtered;
}

export function getActiveVehicle(): VehicleProfile {
  const vehicles = loadSavedVehicles();
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
    if (activeId) {
      const found = vehicles.find(v => v.id === activeId);
      if (found) return found;
    }
  } catch (e) {
    console.warn('Could not read active vehicle ID:', e);
  }
  return vehicles[0] || DEFAULT_VEHICLES[0];
}

export function setActiveVehicleId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID, id);
  } catch (e) {
    console.warn('Could not persist active vehicle ID:', e);
  }
}

export function saveCurrentTripDraft(inputs: TripInputs): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TRIP, JSON.stringify(inputs));
  } catch (e) {
    console.warn('Failed to save current trip draft:', e);
  }
}

export function loadCurrentTripDraft(): TripInputs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_TRIP);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
