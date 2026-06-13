"use client";

import { useEffect } from "react";

// params we lift off the landing url and pin to the umami session.
// umami already auto-captures utms for its aggregate report, but they never
// surface *inside* a session, so attaching them here makes a shared link's
// visitor journey actually inspectable. `ref` doubles as the identify id so
// repeat opens of the same shared link tie back to one visitor.
const TRACKED_PARAMS = [
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export default function UmamiIdentify() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    for (const key of TRACKED_PARAMS) {
      const value = params.get(key);
      if (value) data[key] = value;
    }
    // no attribution params on this landing, nothing to do.
    if (Object.keys(data).length === 0) return;

    const ref = data.ref;

    // script is deferred (and blockable), so umami may not exist yet. poll
    // briefly until it shows up, then give up. dev/blocked = no analytics anyway.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (window.umami) {
        window.clearInterval(timer);
        if (ref) window.umami.identify(ref, data);
        else window.umami.identify(data);
      } else if (tries > 25) {
        window.clearInterval(timer); // ~5s
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}
