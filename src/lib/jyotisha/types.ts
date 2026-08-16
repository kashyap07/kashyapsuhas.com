// core types for the ganita (computational) layer.
//
// everything here is a plain value. no dates are stored as strings, no numbers carry
// hidden units: longitudes are always sidereal degrees 0-360 unless the field says
// tropical, speeds are always degrees per day.

export type GrahaId =
  | "surya"
  | "chandra"
  | "kuja"
  | "budha"
  | "guru"
  | "shukra"
  | "shani"
  | "rahu"
  | "ketu";

/** the seven that have a physical body to point a telescope at. rahu/ketu are nodes. */
export type PhysicalGrahaId = Exclude<GrahaId, "rahu" | "ketu">;

export type Tattva = "agni" | "prithvi" | "vayu" | "jala";
export type Swabhava = "chara" | "sthira" | "dvisvabhava";

export type Rashi = {
  index: number; // 0 = mesha
  name: string;
  kannada: string;
  lord: GrahaId;
  tattva: Tattva;
  swabhava: Swabhava;
};

export type Nakshatra = {
  index: number; // 0 = ashwini
  name: string;
  kannada: string;
  lord: GrahaId; // vimshottari dasha lord
};

export type Bhava = {
  index: number; // 0 = tanu (1st)
  name: string;
  kannada: string;
};

export type GrahaPosition = {
  graha: GrahaId;
  /** sidereal ecliptic longitude, 0-360 */
  lon: number;
  /** ecliptic latitude, degrees */
  lat: number;
  /** degrees per day along the ecliptic; negative means vakri */
  speed: number;
  /** vakri = retrograde. rahu/ketu are always vakri by convention */
  vakri: boolean;
  /** 0-11, 0 = mesha */
  rashi: number;
  /** 0-30, position within the rashi */
  degInRashi: number;
  /** 0-26, 0 = ashwini */
  nakshatra: number;
  /** 1-4 */
  pada: number;
};

export type GrahaSet = Record<GrahaId, GrahaPosition>;

/** where and when someone was born, already resolved to an absolute instant. */
export type BirthData = {
  /** the absolute instant. all timezone reasoning happens before this point. */
  when: Date;
  /** degrees north, negative south */
  latitude: number;
  /** degrees east, negative west */
  longitude: number;
  /** metres above sea level, only affects sunrise/sunset by seconds */
  altitude?: number;
};

export type NodeConvention = "mean" | "true";

export type EphemerisOptions = {
  /**
   * indian panchangas use the MEAN node for rahu. most western software defaults to
   * true, and the two differ by up to ~1.8 degrees, which is enough to move rahu into
   * a different nakshatra. mean is the default here deliberately.
   */
  node?: NodeConvention;
};
