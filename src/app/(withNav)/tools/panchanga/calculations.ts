import * as Astronomy from "astronomy-engine";

import {
  MAASAS,
  NAKSHATRAS,
  RITUS,
  SAMVATSARAS,
  TITHIS_KRISHNA,
  TITHIS_SHUKLA,
  VAARAS,
} from "./data";

// lahiri ayanamsa anchored at j2000.0
function getLahiriAyanamsa(jd: number): number {
  const yearsFromJ2000 = (jd - 2451545.0) / 365.25;
  return 23.853 + 0.01396 * yearsFromJ2000;
}

function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function getSiderealLongitudes(date: Date): {
  sunSid: number;
  moonSid: number;
  jd: number;
} {
  const astroTime = Astronomy.MakeTime(date);
  // ut = days since j2000 = jd - 2451545.0
  const jd = astroTime.ut + 2451545.0;
  const ayanamsa = getLahiriAyanamsa(jd);

  // tropical ecliptic longitudes
  const sunLon = Astronomy.SunPosition(astroTime).elon; // EclipticCoordinates.elon
  const moonLon = Astronomy.EclipticGeoMoon(astroTime).lon; // Spherical.lon

  const sunSid = normalize360(sunLon - ayanamsa);
  const moonSid = normalize360(moonLon - ayanamsa);

  return { sunSid, moonSid, jd };
}

// tithi index 0-29 (0=shukla pratipada, 14=purnima, 15=krishna pratipada, 29=amavasya)
function getTithiIndex(moonSid: number, sunSid: number): number {
  const diff = normalize360(moonSid - sunSid);
  return Math.floor(diff / 12);
}

// nakshatra index 0-26
function getNakshatraIndex(moonSid: number): number {
  return Math.floor(moonSid / (360 / 27));
}

// vaara 0=sun ... 6=sat
function getVaaraIndex(date: Date): number {
  return date.getDay();
}

// find most recent new moon before given date
function findLastNewMoon(date: Date): Date {
  const astroTime = Astronomy.MakeTime(date);
  // 0 = new moon phase, search backward with negative limitDays
  const newMoon = Astronomy.SearchMoonPhase(0, astroTime, -35);
  if (newMoon) return newMoon.date;
  // fallback
  const fallback = new Date(date);
  fallback.setDate(fallback.getDate() - 30);
  return fallback;
}

// maasa index 0=chaitra, based on sun's rashi at last new moon
// at new moon, sun is one rashi behind the month name:
//   kumbha(10) new moon → phalguna(11), meena(11) new moon → chaitra(0)
// so: maasaIndex = (rashi + 1) % 12
function getMaasaIndex(date: Date): number {
  const lastNewMoon = findLastNewMoon(date);
  const { sunSid } = getSiderealLongitudes(lastNewMoon);
  const rashi = Math.floor(sunSid / 30);
  return (rashi + 1) % 12;
}

// ritu index 0-5 from maasa index
function getRituIndex(maasaIndex: number): number {
  return Math.floor(maasaIndex / 2);
}

// uttarayana: sun in makara(270°) through mithuna end (<90°)
function getAyana(sunSid: number): "Uttarayana" | "Dakshinayana" {
  if (sunSid >= 270 || sunSid < 90) return "Uttarayana";
  return "Dakshinayana";
}

// find ugadi (chaitra shukla pratipada) for a given gregorian year
// = new moon when sun enters mesha (aries) region, ~march/april
function findUgadi(year: number): Date {
  const searchStart = new Date(year, 2, 10); // march 10
  const astroTime = Astronomy.MakeTime(searchStart);
  const newMoon = Astronomy.SearchMoonPhase(0, astroTime, 45);
  if (!newMoon) return new Date(year, 2, 22);
  // ugadi = day after new moon (shukla pratipada begins at new moon)
  const ugadi = new Date(newMoon.date);
  ugadi.setDate(ugadi.getDate() + 1);
  ugadi.setHours(0, 0, 0, 0);
  return ugadi;
}

// samvatsara: saka year index, verified: saka 1947 → vishvavasu (index 38 = 0-based)
function getSamvatsaraIndex(date: Date): number {
  const year = date.getFullYear();
  const ugadiThisYear = findUgadi(year);

  let sakaYear: number;
  if (date >= ugadiThisYear) {
    // saka epoch: saka 1 = 78 CE ugadi, so saka year = gregorian year - 78
    sakaYear = year - 78;
  } else {
    // before ugadi: still in previous saka year
    sakaYear = year - 79;
  }

  // (sakaYear + 12) % 60 gives 1-based position in cycle; convert to 0-based array index
  const raw = (sakaYear + 12) % 60;
  return raw === 0 ? 59 : raw - 1;
}

export type PanchangaResult = {
  samvatsara: string;
  ayana: string;
  ritu: string;
  maasa: string;
  paksha: string;
  tithi: string;
  vaasara: string;
  nakshatra: string;
};

export function computePanchanga(date: Date): PanchangaResult {
  const { sunSid, moonSid } = getSiderealLongitudes(date);

  const tithiIndex = getTithiIndex(moonSid, sunSid);
  const paksha = tithiIndex <= 14 ? "Shukla" : "Krishna";
  const tithi =
    tithiIndex <= 14
      ? TITHIS_SHUKLA[tithiIndex]
      : TITHIS_KRISHNA[tithiIndex - 15];

  const nakshatraIndex = getNakshatraIndex(moonSid);
  const vaaraIndex = getVaaraIndex(date);
  const maasaIndex = getMaasaIndex(date);
  const rituIndex = getRituIndex(maasaIndex);
  const ayana = getAyana(sunSid);
  const samvatsaraIndex = getSamvatsaraIndex(date);

  return {
    samvatsara: SAMVATSARAS[samvatsaraIndex],
    ayana,
    ritu: RITUS[rituIndex],
    maasa: MAASAS[maasaIndex],
    paksha,
    tithi,
    vaasara: VAARAS[vaaraIndex],
    nakshatra: NAKSHATRAS[nakshatraIndex],
  };
}
