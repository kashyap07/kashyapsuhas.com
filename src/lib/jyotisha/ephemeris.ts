// sidereal positions of the nava graha.
//
// frame: geocentric apparent, true ecliptic of date, then shifted by the lahiri
// ayanamsa. that is the frame every indian panchanga works in.
import * as Astronomy from "astronomy-engine";

import { DEG, norm360, signedDiff } from "./angles";
import { ayanamsa } from "./ayanamsa";
import { NAKSHATRA_SPAN, PADA_SPAN, RASHI_SPAN } from "./constants";
import type {
  EphemerisOptions,
  GrahaId,
  GrahaPosition,
  GrahaSet,
  PhysicalGrahaId,
} from "./types";

const BODY: Record<PhysicalGrahaId, Astronomy.Body> = {
  surya: Astronomy.Body.Sun,
  chandra: Astronomy.Body.Moon,
  kuja: Astronomy.Body.Mars,
  budha: Astronomy.Body.Mercury,
  guru: Astronomy.Body.Jupiter,
  shukra: Astronomy.Body.Venus,
  shani: Astronomy.Body.Saturn,
};

/** step for central-difference speed, in days. ~14 min. */
const SPEED_H = 0.01;

/** sidereal longitude of a physical graha. */
function siderealLon(
  graha: PhysicalGrahaId,
  time: Astronomy.AstroTime,
): number {
  // aberration + light-time corrected, i.e. apparent position
  const vec = Astronomy.GeoVector(BODY[graha], time, true);
  const ecl = Astronomy.Ecliptic(vec); // true ecliptic of date
  return norm360(ecl.elon - ayanamsa(time));
}

function eclipticLat(
  graha: PhysicalGrahaId,
  time: Astronomy.AstroTime,
): number {
  const vec = Astronomy.GeoVector(BODY[graha], time, true);
  return Astronomy.Ecliptic(vec).elat;
}

/**
 * mean lunar node, meeus ch.47 (47.7), referred to the MEAN equinox of date.
 * indian panchangas use the mean node for rahu, not the osculating true node.
 */
function meanNodeMeanEquinox(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525;
  return norm360(
    125.0445479 -
      1934.1362891 * T +
      0.0020754 * T * T +
      (T * T * T) / 467441 -
      (T * T * T * T) / 60616000,
  );
}

/**
 * mean node in our working frame.
 *
 * meeus gives the node against the mean equinox, but the ayanamsa is measured against
 * the TRUE ecliptic of date, so nutation in longitude has to be added before the two
 * can be differenced. skipping this leaves an 18 arcsec error that oscillates on the
 * 18.6 year nutation period, which is exactly the sort of thing that looks like noise
 * and never gets found. verified against swisseph: 18.09 arcsec worst without the
 * correction, 0.21 arcsec with it.
 */
function siderealMeanNode(time: Astronomy.AstroTime): number {
  const nutationDeg = Astronomy.e_tilt(time).dpsi / 3600; // dpsi is arcsec
  return norm360(meanNodeMeanEquinox(time) + nutationDeg - ayanamsa(time));
}

/**
 * true (osculating) node, from the moon's instantaneous orbital plane.
 * the orbit normal is h = r x v; the ascending node points along zhat x h.
 */
function siderealTrueNode(time: Astronomy.AstroTime): number {
  const state = Astronomy.GeoMoonState(time);
  const rot = Astronomy.Rotation_EQJ_ECT(time);
  const r = Astronomy.RotateVector(
    rot,
    new Astronomy.Vector(state.x, state.y, state.z, time),
  );
  const v = Astronomy.RotateVector(
    rot,
    new Astronomy.Vector(state.vx, state.vy, state.vz, time),
  );
  // h = r x v. only the x,y components matter below, so hz is not computed.
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  // n = zhat x h  =>  (-hy, hx, 0)
  const tropical = norm360(Math.atan2(hx, -hy) / DEG);
  return norm360(tropical - ayanamsa(time));
}

function nodeLon(
  time: Astronomy.AstroTime,
  convention: "mean" | "true",
): number {
  return convention === "true"
    ? siderealTrueNode(time)
    : siderealMeanNode(time);
}

/** central difference, wrap-safe. */
function rateOfChange(
  f: (t: Astronomy.AstroTime) => number,
  time: Astronomy.AstroTime,
): number {
  const before = f(time.AddDays(-SPEED_H));
  const after = f(time.AddDays(SPEED_H));
  return signedDiff(after, before) / (2 * SPEED_H);
}

function describe(
  graha: GrahaId,
  lon: number,
  lat: number,
  speed: number,
  vakri: boolean,
): GrahaPosition {
  const rashi = Math.floor(lon / RASHI_SPAN);
  const nakshatra = Math.floor(lon / NAKSHATRA_SPAN);
  const pada = Math.floor((lon - nakshatra * NAKSHATRA_SPAN) / PADA_SPAN) + 1;
  return {
    graha,
    lon,
    lat,
    speed,
    vakri,
    rashi,
    degInRashi: lon - rashi * RASHI_SPAN,
    nakshatra,
    pada,
  };
}

/** all nine grahas at an instant. */
export function grahaPositions(
  date: Date,
  opts: EphemerisOptions = {},
): GrahaSet {
  const time = Astronomy.MakeTime(date);
  const convention = opts.node ?? "mean";

  const out = {} as GrahaSet;

  for (const graha of Object.keys(BODY) as PhysicalGrahaId[]) {
    const lon = siderealLon(graha, time);
    const speed = rateOfChange((t) => siderealLon(graha, t), time);
    out[graha] = describe(
      graha,
      lon,
      eclipticLat(graha, time),
      speed,
      speed < 0,
    );
  }

  const rahuLon = nodeLon(time, convention);
  const rahuSpeed = rateOfChange((t) => nodeLon(t, convention), time);
  // the nodes are always vakri by convention, and the mean node genuinely is
  out.rahu = describe("rahu", rahuLon, 0, rahuSpeed, true);
  out.ketu = describe("ketu", norm360(rahuLon + 180), 0, rahuSpeed, true);

  return out;
}

export function grahaPosition(
  graha: GrahaId,
  date: Date,
  opts: EphemerisOptions = {},
): GrahaPosition {
  return grahaPositions(date, opts)[graha];
}

/** sidereal longitude of a single graha, cheap path for root-finding. */
export function siderealLongitude(
  graha: GrahaId,
  time: Astronomy.AstroTime,
  opts: EphemerisOptions = {},
): number {
  if (graha === "rahu") return nodeLon(time, opts.node ?? "mean");
  if (graha === "ketu")
    return norm360(nodeLon(time, opts.node ?? "mean") + 180);
  return siderealLon(graha, time);
}
