"use client";

import { ReactNode, createContext, useContext } from "react";

import type { TripRoute } from "./types";

// route data is serialized once from the server (CustomMDX) and shared by
// every map component in the post via context, instead of each client
// component bundling its own copy of route.json.
const TripRouteContext = createContext<TripRoute | null>(null);

export function TripRouteProvider({
  route,
  children,
}: {
  route: TripRoute;
  children: ReactNode;
}) {
  return (
    <TripRouteContext.Provider value={route}>
      {children}
    </TripRouteContext.Provider>
  );
}

export function useTripRoute(): TripRoute {
  const route = useContext(TripRouteContext);
  if (!route) {
    throw new Error(
      "useTripRoute must be used inside a post with `trip` frontmatter",
    );
  }
  return route;
}
