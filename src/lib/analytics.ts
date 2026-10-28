/**
 * Analytics Abstraction for RouteWise
 * Event telemetry logging without external ad trackers or sensitive coordinate leakage.
 */

export type AnalyticsEvent =
  | 'trip_search_started'
  | 'trip_search_submitted'
  | 'trip_results_viewed'
  | 'transport_mode_selected'
  | 'road_cost_breakdown_viewed'
  | 'trip_assumptions_changed'
  | 'scenario_created'
  | 'trip_saved'
  | 'trip_shared'
  | 'booking_cta_clicked';

export function trackEvent(eventName: AnalyticsEvent, payload?: Record<string, unknown>): void {
  // Safe console telemetry for development & debugging
  if (typeof window !== 'undefined' && (window as unknown as { __ROUTEWISE_DEBUG__?: boolean }).__ROUTEWISE_DEBUG__) {
    console.debug(`[RouteWise Telemetry] ${eventName}`, payload);
  }
}
