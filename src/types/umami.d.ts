// global umami tracker, injected by the cloud script in prod only.
// optional on purpose: ad-blockers and dev builds never set it, so any
// caller must null-check before touching it.

type UmamiTracker = {
  track: (eventName?: string, eventData?: Record<string, unknown>) => void;
  // overloaded: id only, id + data, or data only. a stable id ties
  // multiple sessions together instead of counting them as separate visits.
  identify: {
    (id: string): void;
    (id: string, data: Record<string, unknown>): void;
    (data: Record<string, unknown>): void;
  };
};

interface Window {
  umami?: UmamiTracker;
}
