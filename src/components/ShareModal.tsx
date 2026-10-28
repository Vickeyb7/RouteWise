import React, { useState } from 'react';
import { TripInputs, TripCalculationResult } from '../types/index.ts';
import { formatINR } from '../lib/tripCalculations.ts';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: TripInputs;
  result: TripCalculationResult;
  onShowToast: (msg: string) => void;
  onSaveTrip?: () => void;
  isTripSaved?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  inputs,
  result,
  onShowToast,
  onSaveTrip,
  isTripSaved,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const bestMode = result.modes.find(m => m.id === result.cheapestModeId);

  const summaryText = `🚗 RouteWise Trip Plan: ${inputs.origin} ➔ ${inputs.destination}
• Total Distance: ${result.totalDistanceKm} km (${inputs.isRoundTrip ? 'Round-trip' : 'One-way'})
• Passengers: ${inputs.passengers} travellers
• Personal Car: ${formatINR(result.totalDrivingCost)} total (${formatINR(result.costPerPerson)}/pax)
  - Fuel: ${formatINR(result.fuelCost)} (${result.fuelConsumptionUnits} ${inputs.vehicle.fuelType === 'cng' ? 'kg' : 'L'})
  - Tolls: ${formatINR(result.tollCost)}
• Lowest Cost Public Transit: ${bestMode?.title || 'Train'} @ ${formatINR(bestMode?.totalCost || 0)} total
• Fastest: Flight (${result.modes.find(m => m.id === 'flight')?.doorToDoorFormatted})

Calculated on RouteWise Travel Cost Planner.`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `RouteWise Plan: ${inputs.origin} to ${inputs.destination}`,
          text: summaryText,
          url: window.location.href,
        });
        onShowToast('Plan shared successfully!');
        onClose();
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Native share failed, using clipboard:', err);
        }
      }
    }
    handleCopyClipboard();
  };

  const handleCopyClipboard = () => {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        setCopied(true);
        onShowToast('Trip summary copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        onShowToast('Could not copy to clipboard. Please copy manually.');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-container flex flex-col">
        {/* Header */}
        <div className="p-space-md border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">share</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Save & Share Trip Plan</h3>
              <p className="font-body-sm text-body-sm text-secondary">
                Share this cost comparison with travel companions
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

        {/* Content */}
        <div className="p-space-md space-y-space-md">
          {/* Formatted summary preview */}
          <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container font-mono text-body-sm text-on-surface whitespace-pre-line select-all leading-relaxed">
            {summaryText}
          </div>

          <div className="flex items-center gap-2 text-outline font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
            <span>Zero personal coordinates or secrets are included in this summary.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-2 flex-wrap">
          {onSaveTrip && (
            <button
              onClick={() => {
                onSaveTrip();
              }}
              className={`px-3.5 py-2 rounded-xl text-title-sm font-semibold transition-all border shadow-sm flex items-center gap-1.5 ${
                isTripSaved
                  ? 'bg-tertiary text-on-tertiary border-tertiary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high border-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isTripSaved ? 'bookmark_added' : 'bookmark_add'}
              </span>
              <span>{isTripSaved ? 'Saved in Vault' : 'Save to Vault'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopyClipboard}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-title-sm text-title-sm flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-title-sm text-title-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5 font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
