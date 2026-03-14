// lookup tables for panchanga elements

export const SAMVATSARAS = [
  "Prabhava",
  "Vibhava",
  "Shukla",
  "Pramodoota",
  "Prajotpatti",
  "Angirasa",
  "Shrimukha",
  "Bhava",
  "Yuva",
  "Dhaatu",
  "Ishvara",
  "Bahudhanya",
  "Pramadi",
  "Vikrama",
  "Vrusha",
  "Chitrabhanu",
  "Subhanu",
  "Tarana",
  "Parthiva",
  "Vyaya",
  "Sarvajit",
  "Sarvadhari",
  "Virodhi",
  "Vikruti",
  "Khara",
  "Nandana",
  "Vijaya",
  "Jaya",
  "Manmatha",
  "Durmukhi",
  "Hevilambi",
  "Vilambi",
  "Vikari",
  "Sharvari",
  "Plava",
  "Shubhakrut",
  "Sobhakrut",
  "Krodhi",
  "Vishvavasu",
  "Parabhava",
  "Plavanga",
  "Keelaka",
  "Saumya",
  "Sadharana",
  "Virodhikrut",
  "Paridhavi",
  "Pramaadi",
  "Ananda",
  "Rakshasa",
  "Nala",
  "Pingala",
  "Kaalayukta",
  "Siddharthi",
  "Raudra",
  "Durmati",
  "Dundubhi",
  "Rudhirodgari",
  "Raktakshi",
  "Krodhana",
  "Akshaya",
];

// tithi names: index 0-29
// 0-13 = shukla pratipada to chaturdashi, 14 = purnima
// 15-28 = krishna pratipada to chaturdashi, 29 = amavasya
export const TITHIS_SHUKLA = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashti",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dvadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
];

export const TITHIS_KRISHNA = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashti",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dvadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya",
];

export const NAKSHATRAS = [
  "Ashvini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Svati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishtha",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

// maasa names in amanta order (chaitra=0)
export const MAASAS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvina",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
];

export const VAARAS = [
  "Ravi",
  "Soma",
  "Mangala",
  "Budha",
  "Guru",
  "Shukra",
  "Shani",
];

// ritu by maasa pair index (0=chaitra/vaishakha → vasantha)
export const RITUS = [
  "Vasantha",  // chaitra, vaishakha
  "Grishma",   // jyeshtha, ashadha
  "Varsha",    // shravana, bhadrapada
  "Sharad",    // ashvina, kartika
  "Hemantha",  // margashirsha, pausha
  "Shishira",  // magha, phalguna
];

// devanagari script for every value returned by computePanchanga.
// some names collide across categories (e.g. "Jyeshtha" = maasa and nakshatra)
// — DEVANAGARI uses the maasa/non-nakshatra form; DEVANAGARI_NAKSHATRA overrides for nakshatras.
export const DEVANAGARI: Record<string, string> = {
  // samvatsaras
  Prabhava: "प्रभव", Vibhava: "विभव", Shukla: "शुक्ल", Pramodoota: "प्रमोदूत",
  Prajotpatti: "प्रजोत्पत्ति", Angirasa: "आङ्गिरस", Shrimukha: "श्रीमुख", Bhava: "भव",
  Yuva: "युव", Dhaatu: "धातु", Ishvara: "ईश्वर", Bahudhanya: "बहुधान्य",
  Pramadi: "प्रमादि", Vikrama: "विक्रम", Vrusha: "वृष", Chitrabhanu: "चित्रभानु",
  Subhanu: "सुभानु", Tarana: "तारण", Parthiva: "पार्थिव", Vyaya: "व्यय",
  Sarvajit: "सर्वजित्", Sarvadhari: "सर्वधारि", Virodhi: "विरोधि", Vikruti: "विकृति",
  Khara: "खर", Nandana: "नन्दन", Vijaya: "विजय", Jaya: "जय",
  Manmatha: "मन्मथ", Durmukhi: "दुर्मुखि", Hevilambi: "हेविलम्बि", Vilambi: "विलम्बि",
  Vikari: "विकारि", Sharvari: "शार्वरि", Plava: "प्लव", Shubhakrut: "शुभकृत्",
  Sobhakrut: "शोभकृत्", Krodhi: "क्रोधि", Vishvavasu: "विश्वावसु", Parabhava: "पराभव",
  Plavanga: "प्लवङ्ग", Keelaka: "कीलक", Saumya: "सौम्य", Sadharana: "साधारण",
  Virodhikrut: "विरोधकृत्", Paridhavi: "परिधावि", Pramaadi: "प्रमादि", Ananda: "आनन्द",
  Rakshasa: "राक्षस", Nala: "नल", Pingala: "पिङ्गल", Kaalayukta: "कालयुक्त",
  Siddharthi: "सिद्धार्थि", Raudra: "रौद्र", Durmati: "दुर्मति", Dundubhi: "दुन्दुभि",
  Rudhirodgari: "रुधिरोद्गारि", Raktakshi: "रक्ताक्षि", Krodhana: "क्रोधन", Akshaya: "अक्षय",
  // ayanas
  Uttarayana: "उत्तरायण", Dakshinayana: "दक्षिणायन",
  // ritus
  Vasantha: "वसन्त", Grishma: "ग्रीष्म", Varsha: "वर्षा",
  Sharad: "शरद्", Hemantha: "हेमन्त", Shishira: "शिशिर",
  // maasas (jyeshtha/shravana/magha are maasa forms here)
  Chaitra: "चैत्र", Vaishakha: "वैशाख", Jyeshtha: "ज्येष्ठ", Ashadha: "आषाढ",
  Shravana: "श्रावण", Bhadrapada: "भाद्रपद", Ashvina: "आश्विन", Kartika: "कार्तिक",
  Margashirsha: "मार्गशीर्ष", Pausha: "पौष", Magha: "माघ", Phalguna: "फाल्गुन",
  // pakshas
  Krishna: "कृष्ण",
  // tithis
  Pratipada: "प्रतिपदा", Dvitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पञ्चमी", Shashti: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dvadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
  // vaaras (planet name only; "vaasara" suffix added in mantra template)
  Ravi: "रवि", Soma: "सोम", Mangala: "मङ्गल",
  Budha: "बुध", Guru: "गुरु", Shukra: "शुक्र", Shani: "शनि",
  // nakshatras (unique ones; conflicting names overridden in DEVANAGARI_NAKSHATRA)
  Ashvini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी",
  Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य",
  Ashlesha: "आश्लेषा", "Purva Phalguni": "पूर्व फाल्गुनी",
  "Uttara Phalguni": "उत्तर फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा",
  Svati: "स्वाति", Vishakha: "विशाखा", Anuradha: "अनुराधा",
  Mula: "मूल", "Purva Ashadha": "पूर्वाषाढा", "Uttara Ashadha": "उत्तराषाढा",
  Dhanishtha: "धनिष्ठा", Shatabhisha: "शतभिषा",
  "Purva Bhadrapada": "पूर्वभाद्रपदा", "Uttara Bhadrapada": "उत्तरभाद्रपदा", Revati: "रेवती",
};

// nakshatra-specific overrides for names that collide with maasa names
export const DEVANAGARI_NAKSHATRA: Record<string, string> = {
  ...DEVANAGARI,
  Magha: "मघा",       // nakshatra (maasa form: माघ)
  Jyeshtha: "ज्येष्ठा", // nakshatra (maasa form: ज्येष्ठ)
  Shravana: "श्रवण",   // nakshatra (maasa form: श्रावण)
};
