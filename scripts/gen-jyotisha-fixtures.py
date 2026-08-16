#!/usr/bin/env python3
"""
regenerates the swiss ephemeris ground truth that src/lib/jyotisha is tested against.

this is a dev-time tool, not a runtime dependency. the emitted json is committed so
tests run without python or swisseph installed.

usage:
    python3 -m venv /tmp/se-venv
    /tmp/se-venv/bin/pip install pyswisseph
    /tmp/se-venv/bin/python scripts/gen-jyotisha-fixtures.py

uses the moshier ephemeris (bundled with pyswisseph, no data files needed) so anyone
can regenerate this byte-identically. moshier is good to ~1 arcsec for the grahas over
1800-2200, which is well inside what jyotisha needs (the tightest boundary that matters
is a nakshatra pada at 50 arcmin). the ayanamsa is a pure precession computation and is
independent of the ephemeris choice.
"""

import json
import os
from datetime import datetime, timezone

import swisseph as swe

OUT = os.path.join(
    os.path.dirname(__file__),
    "..",
    "src",
    "lib",
    "jyotisha",
    "__tests__",
    "fixtures",
    "swisseph-reference.json",
)

# swisseph body id -> our kannada key. rahu is the MEAN node: that is what indian
# panchangas (including drik-ganita ones) use. true node is emitted alongside so the
# engine can offer it, and so the difference stays visible in tests.
BODIES = [
    ("surya", swe.SUN),
    ("chandra", swe.MOON),
    ("budha", swe.MERCURY),
    ("shukra", swe.VENUS),
    ("kuja", swe.MARS),
    ("guru", swe.JUPITER),
    ("shani", swe.SATURN),
    ("rahu_mean", swe.MEAN_NODE),
    ("rahu_true", swe.TRUE_NODE),
]

# dates chosen to stress the engine, not to be pretty:
#   1900/1950  - far enough back that a linear ayanamsa fit visibly breaks
#   1942-09-01 - india was on wartime +6:30
#   1955-12-31 - bombay time was still in local use until this year
#   2000-01-01 12:00 UT - j2000 exactly, the anchor epoch
#   2050       - forward extrapolation
# times are UT, as integer h/m/s. they are NOT decimal hours: deriving the iso string
# from a float hour lets iso and jd_ut disagree by a second, and one second of time is
# ~15 arcsec of ascendant, which reads as a lagna bug that is really a fixture bug.
SAMPLE_TIMES = [
    (1900, 1, 1, 0, 0, 0),
    (1925, 6, 15, 7, 30, 0),
    (1942, 9, 1, 3, 45, 0),
    (1950, 3, 21, 12, 0, 0),
    (1955, 12, 31, 18, 15, 0),
    (1975, 8, 15, 2, 30, 0),
    (1983, 11, 7, 22, 6, 37),
    (1990, 1, 1, 0, 0, 0),
    (2000, 1, 1, 12, 0, 0),
    (2011, 4, 3, 9, 36, 14),
    (2026, 8, 16, 6, 0, 0),
    (2050, 1, 1, 0, 0, 0),
]

# lat, lon, label. negative lon is west in swisseph.
PLACES = [
    (12.9716, 77.5946, "bengaluru"),
    (13.3409, 74.7421, "udupi"),
    (28.6139, 77.2090, "delhi"),
    (8.0883, 77.5385, "kanyakumari"),
    (51.5074, -0.1278, "london"),
]


def jd_of(y, m, d, hh, mm, ss):
    return swe.julday(y, m, d, hh + mm / 60 + ss / 3600, swe.GREG_CAL)


def iso_of(y, m, d, hh, mm, ss):
    return (
        datetime(y, m, d, hh, mm, ss, tzinfo=timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


def main():
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    base_flags = swe.FLG_MOSEPH | swe.FLG_SPEED

    ayanamsa = []
    grahas = []
    lagna = []

    for y, m, d, hh, mm, ss in SAMPLE_TIMES:
        jd = jd_of(y, m, d, hh, mm, ss)
        iso = iso_of(y, m, d, hh, mm, ss)

        _, ayan = swe.get_ayanamsa_ex_ut(jd, base_flags)
        ayanamsa.append({"iso": iso, "jd_ut": jd, "deg": ayan})

        positions = {}
        for key, body in BODIES:
            xx, _ = swe.calc_ut(jd, body, base_flags | swe.FLG_SIDEREAL)
            positions[key] = {
                "lon": xx[0],
                "lat": xx[1],
                "speed": xx[3],
            }
        # ketu is definitionally rahu opposed; emitted so the engine's own
        # derivation is checked rather than assumed
        positions["ketu_mean"] = {
            "lon": (positions["rahu_mean"]["lon"] + 180.0) % 360.0,
            "lat": -positions["rahu_mean"]["lat"],
            "speed": positions["rahu_mean"]["speed"],
        }
        grahas.append({"iso": iso, "jd_ut": jd, "positions": positions})

        for plat, plon, label in PLACES:
            # 'W' = whole sign. we only read ascmc here; cusps are trivially derived
            # from the lagna rashi under whole sign, and that derivation is what the
            # ts side is being tested on.
            cusps, ascmc = swe.houses_ex(
                jd, plat, plon, b"W", base_flags | swe.FLG_SIDEREAL
            )
            lagna.append(
                {
                    "iso": iso,
                    "jd_ut": jd,
                    "place": label,
                    "lat": plat,
                    "lon": plon,
                    "ascendant": ascmc[0],
                    "mc": ascmc[1],
                    "cusps": list(cusps),
                }
            )

    payload = {
        "meta": {
            "generator": "scripts/gen-jyotisha-fixtures.py",
            "swisseph": swe.version,
            "ephemeris": "moshier (FLG_MOSEPH)",
            "ayanamsa": "SIDM_LAHIRI",
            "frame": "true ecliptic of date, geocentric apparent, sidereal",
            "note": "rahu is the mean node; indian panchangas use mean, not true",
        },
        "ayanamsa": ayanamsa,
        "grahas": grahas,
        "lagna": lagna,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")
    print(f"wrote {os.path.relpath(OUT)}")
    print(f"  {len(ayanamsa)} ayanamsa samples")
    print(f"  {len(grahas)} graha epochs x {len(BODIES) + 1} bodies")
    print(f"  {len(lagna)} lagna samples")


if __name__ == "__main__":
    main()
