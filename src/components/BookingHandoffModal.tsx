import React from 'react';
import { TransportModeEstimate, TripInputs } from '../types/index.ts';
import { formatINR } from '../lib/tripCalculations.ts';

interface BookingHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TransportModeEstimate | null;
  inputs: TripInputs;
}

export const BookingHandoffModal: React.FC<BookingHandoffModalProps> = ({
  isOpen,
  onClose,
  mode,
  inputs,
}) => {
  if (!isOpen || !mode) return null;

  // Generate genuine external search URL based on mode
  let providerName = 'External Provider';
  let externalUrl = '';
  let providerNote = '';

  const originClean = encodeURIComponent(inputs.origin.split(',')[0].trim());
  const destClean = encodeURIComponent(inputs.destination.split(',')[0].trim());

  if (mode.id === 'bus') {
    providerName = 'redBus / IntrCity SmartBus';
    externalUrl = `https://www.redbus.in/bus-tickets/${originClean.toLowerCase()}-to-${destClean.toLowerCase()}`;
    providerNote = 'Redirecting to verified Indian intercity bus ticketing partner. Note: Local auto/cab transfer fees (₹500) are paid separately to local drivers.';
  } else if (mode.id === 'train') {
    providerName = 'IRCTC Indian Railways';
    externalUrl = `https://www.irctc.co.in/nget/train-search`;
    providerNote = 'Indian Railways Reservation (PRS). Note: RouteWise estimate includes ₹400 for station arrival/departure cabs to ensure true door-to-door comparability.';
  } else if (mode.id === 'flight') {
    providerName = 'Skyscanner / MakeMyTrip Flights';
    externalUrl = `https://www.google.com/travel/flights?q=flights%20from%20${originClean}%20to%20${destClean}`;
    providerNote = 'Aviation Search: Direct airfare does not include airport terminal taxis (typically ₹2,000+ at Goa Mopa Airport). RouteWise includes them in the total.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-container flex flex-col">
        {/* Header */}
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">north_east</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">External Booking Handoff</h3>
              <span className="font-label-sm text-label-sm text-outline">Partner: {providerName}</span>
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

        {/* Content */}
        <div className="p-space-md space-y-space-md">
          {/* Fare Summary */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
            <div>
              <span className="font-title-sm text-title-sm text-on-surface block">{mode.title}</span>
              <span className="font-body-sm text-body-sm text-secondary">
                {inputs.passengers} traveller{inputs.passengers > 1 ? 's' : ''} • {mode.doorToDoorFormatted} door-to-door
              </span>
            </div>
            <div className="text-right">
              <span className="font-numeric-data-lg text-numeric-data-lg text-primary block">
                {formatINR(mode.totalCost)}
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {formatINR(mode.costPerPerson)} / person
              </span>
            </div>
          </div>

          {/* Itemized composition */}
          <div className="space-y-1.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Fare Ledger Breakdown
            </span>
            <div className="space-y-1 bg-surface-container-low/50 p-2.5 rounded-lg text-body-sm text-body-sm">
              {mode.itemizedDetails.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-outline">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <span className="font-medium text-on-surface">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosure notice */}
          <div className="bg-secondary-container/30 p-3 rounded-lg flex items-start gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-body-sm text-secondary leading-snug">
              {providerNote}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-secondary hover:text-on-surface font-title-sm text-title-sm"
            type="button"
          >
            Close
          </button>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Proceed to {providerName.split('/')[0].trim()}</span>
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
};
