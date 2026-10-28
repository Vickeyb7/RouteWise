import React, { useState } from 'react';
import { VehicleProfile, FuelType, MileageUnit, FuelPriceUnit } from '../types/index.ts';

interface VehicleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleProfile[];
  activeVehicleId: string;
  onSelectVehicle: (vehicle: VehicleProfile) => void;
  onSaveVehicle: (vehicle: VehicleProfile) => void;
  onDeleteVehicle: (id: string) => void;
}

export const VehicleManagerModal: React.FC<VehicleManagerModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onSaveVehicle,
  onDeleteVehicle,
}) => {
  if (!isOpen) return null;

  const [editingVehicle, setEditingVehicle] = useState<VehicleProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleProfile | null>(null);

  const startCreate = () => {
    setIsCreating(true);
    setEditingVehicle({
      id: 'veh-' + Date.now(),
      name: 'My New Vehicle',
      fuelType: 'petrol',
      mileage: 15.0,
      mileageUnit: 'km/L',
      fuelPrice: 105.0,
      fuelPriceUnit: '₹/L',
      vehicleClass: 'Sedan',
      terrainAdjustment: 1.0,
    });
  };

  const handleDuplicate = (v: VehicleProfile) => {
    const duplicated: VehicleProfile = {
      ...v,
      id: 'veh-' + Date.now(),
      name: `${v.name} (Copy)`,
    };
    onSaveVehicle(duplicated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onSaveVehicle(editingVehicle);
      setEditingVehicle(null);
      setIsCreating(false);
    }
  };

  const handleFuelTypeChange = (fuelType: FuelType) => {
    if (!editingVehicle) return;
    let mileageUnit: MileageUnit = 'km/L';
    let fuelPriceUnit: FuelPriceUnit = '₹/L';
    let defaultPrice = 105.0;

    if (fuelType === 'diesel') {
      defaultPrice = 92.5;
    } else if (fuelType === 'cng') {
      mileageUnit = 'km/kg';
      fuelPriceUnit = '₹/kg';
      defaultPrice = 85.0;
    } else if (fuelType === 'electric') {
      mileageUnit = 'km/kWh';
      fuelPriceUnit = '₹/kWh';
      defaultPrice = 9.0;
    }

    setEditingVehicle({
      ...editingVehicle,
      fuelType,
      mileageUnit,
      fuelPriceUnit,
      fuelPrice: defaultPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">garage</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Vehicle Garage & Profiles</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                Manage fuel efficiencies, engine classes, and fuel prices
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

        {/* Modal Content */}
        <div className="p-space-md overflow-y-auto space-y-space-md">
          {!editingVehicle ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-title-sm text-title-sm text-on-surface">Saved Vehicles</span>
                <button
                  onClick={startCreate}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* List of vehicles */}
              <div className="divide-y divide-surface-container-high/60 bg-surface-container-low rounded-xl overflow-hidden border border-surface-container">
                {vehicles.map(v => {
                  const isActive = v.id === activeVehicleId;
                  return (
                    <div key={v.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">directions_car</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-title-sm text-title-sm text-on-surface truncate font-semibold">
                              {v.name}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-body-sm text-secondary truncate">
                            {v.mileage} {v.mileageUnit} • ₹{v.fuelPrice}/{v.fuelType === 'cng' ? 'kg' : 'L'} •{' '}
                            {v.vehicleClass}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectVehicle(v);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors"
                            type="button"
                          >
                            Select
                          </button>
                        )}
                        <button
                          onClick={() => setEditingVehicle({ ...v })}
                          className="p-1.5 rounded hover:bg-surface-container text-secondary hover:text-on-surface"
                          type="button"
                          title="Edit vehicle"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(v)}
                          className="p-1.5 rounded hover:bg-surface-container text-secondary hover:text-on-surface"
                          type="button"
                          title="Duplicate vehicle"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        {vehicles.length > 1 && (
                          <button
                            onClick={() => setVehicleToDelete(v)}
                            className="p-1.5 rounded hover:bg-error-container/40 text-outline hover:text-error"
                            type="button"
                            title="Delete vehicle"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Vehicle Edit/Create Form */
            <form onSubmit={handleSaveForm} className="space-y-space-md">
              <div className="flex items-center justify-between pb-1 border-b border-surface-container">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                  {isCreating ? 'Create Vehicle Profile' : 'Edit Vehicle Profile'}
                </span>
                <button
                  onClick={() => {
                    setEditingVehicle(null);
                    setIsCreating(false);
                  }}
                  className="font-label-md text-label-md text-secondary hover:text-on-surface"
                  type="button"
                >
                  Back to List
                </button>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={editingVehicle.name}
                  onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-title-sm text-title-sm focus:outline-none"
                  required
                />
              </div>

              {/* Fuel Type Radios */}
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1.5">
                  Fuel Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['petrol', 'diesel', 'cng', 'electric'] as FuelType[]).map(ft => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => handleFuelTypeChange(ft)}
                      className={`py-2 rounded-lg text-center font-label-md text-label-md capitalize transition-all border ${
                        editingVehicle.fuelType === ft
                          ? 'bg-primary text-on-primary border-primary font-semibold shadow-sm'
                          : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mileage & Fuel Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                    Efficiency ({editingVehicle.mileageUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="60"
                    value={editingVehicle.mileage}
                    onChange={e =>
                      setEditingVehicle({ ...editingVehicle, mileage: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-numeric-data-md text-numeric-data-md"
                    required
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                    Price ({editingVehicle.fuelPriceUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="250"
                    value={editingVehicle.fuelPrice}
                    onChange={e =>
                      setEditingVehicle({ ...editingVehicle, fuelPrice: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-numeric-data-md text-numeric-data-md"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Class */}
              <div>
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                  Vehicle Body Class
                </label>
                <select
                  value={editingVehicle.vehicleClass}
                  onChange={e => setEditingVehicle({ ...editingVehicle, vehicleClass: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-title-sm text-title-sm focus:outline-none"
                >
                  <option value="Hatchback">Hatchback (Light compact)</option>
                  <option value="Sedan">Sedan (Executive)</option>
                  <option value="SUV">SUV (High ground clearance)</option>
                  <option value="Compact">Compact / MPV</option>
                  <option value="EV">Electric Crossover</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVehicle(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-surface-container text-secondary font-title-sm text-title-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-outline">
            Stored locally in browser storage
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-title-sm text-title-sm hover:bg-surface-container"
            type="button"
          >
            Done
          </button>
        </div>

        {/* In-app vehicle deletion confirmation dialog */}
        {vehicleToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md max-w-sm w-full shadow-2xl border border-surface-container space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">delete</span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">Remove Vehicle?</h3>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">
                    Are you sure you want to remove &quot;{vehicleToDelete.name}&quot; from your garage?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-secondary hover:text-on-surface font-title-sm text-title-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteVehicle(vehicleToDelete.id);
                    setVehicleToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 font-title-sm text-title-sm font-semibold shadow-sm"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
