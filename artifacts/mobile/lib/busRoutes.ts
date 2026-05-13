/**
 * SRTM (Société Régionale de Transport de Médenine) bus routes — Djerba island.
 *
 * Data sourced from the official Tunisian Open Transport Portal:
 *   Station GPS coords:  catalogue-data.transport.tn › liste-des-stations-de-la-srtm
 *   Route stop sequences: catalogue-data.transport.tn › horaires-des-bus-de-la-srtm
 *
 * The XLSX has 8 agency sheets. All rows whose stop sequences include Djerba
 * island stations were extracted. Ten SRTM line references operate on the island;
 * they resolve to 5 unique physical paths shown below.
 *
 * Route analysis:
 *   RG1201  Médenine ↔ Midoun (sheet: وكالة مدنين)      ─┐
 *   RG5103  Midoun ↔ Médenine (sheet: وكالة ميدون)       ├─ PATH A (same physical path)
 *   RG7104  Tataouine ↔ Djerba البطاح (sheet: وكالة تطاوين) ┘
 *
 *   RG2401  Zarzis ↔ Houmt Souk (sheet: وكالة جرجيس)    ─┐
 *   RG3401  Ben Guerdane ↔ Houmt Souk (sheet: وكالة بنقردان) ├─ PATH B
 *   RG7201  Tataouine ↔ Houmt Souk via Nafatiya (sheet: وكالة تطاوين) ┘
 *
 *   RG2403  Zarzis ↔ Midoun via El May (sheet: وكالة جرجيس) ─── PATH C
 *
 *   RG2501  Zarzis ↔ Midoun via El Maamoura (sheet: وكالة جرجيس) ─── PATH D
 *
 *   IU4501  Houmt Souk → Sfax (sheet: وكالة ح السوق)    ─┐
 *   IU4502  Houmt Souk → Gabes (sheet: وكالة ح السوق)   ─┘ PATH E
 */

export interface SrtmStop {
  code: string;
  nameFr: string;
  nameAr: string;
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: string;
  refs: string[];           // all SRTM line refs sharing this physical path
  name: string;
  shortName: string;
  color: string;
  stops: SrtmStop[];
}

/**
 * SRTM stations on Djerba island — GPS from the official stations dataset.
 * Code prefixes: HS = Houmt Souk, AJ = Ajim, DN = Midoun, LF = Sidi Makhlouf.
 */
export const SRTM_STATIONS: Record<string, SrtmStop> = {
  // ── Houmt Souk ──────────────────────────────────────────────────────────────
  HS000: { code: "HS000", nameFr: "Houmt Souk",          nameAr: "حومة السوق",    lat: 33.872243, lng: 10.857974 },

  // ── Ajim area (south-west) ──────────────────────────────────────────────────
  AJ035: { code: "AJ035", nameFr: "El Gara",             nameAr: "القرع",          lat: 33.807494, lng: 10.789568 },
  AJ000: { code: "AJ000", nameFr: "Ajim (ferry)",        nameAr: "أجيم",           lat: 33.725348, lng: 10.748368 },

  // ── El Jorf / mainland exit (south-west, past ferry) ───────────────────────
  LF057: { code: "LF057", nameFr: "El Jorf",             nameAr: "الجرف",          lat: 33.696711, lng: 10.731952 },
  LF055: { code: "LF055", nameFr: "Najjar (mosque)",     nameAr: "النجار",         lat: 33.681407, lng: 10.680385 },
  LF052: { code: "LF052", nameFr: "Maghrawiya",          nameAr: "المغراوية",      lat: 33.655848, lng: 10.621198 },

  // ── Central / El May corridor ───────────────────────────────────────────────
  DN092: { code: "DN092", nameFr: "El May",              nameAr: "الماي",          lat: 33.801846, lng: 10.885065 },

  // ── El Kantara bridge / south corridor ─────────────────────────────────────
  DN075: { code: "DN075", nameFr: "Sedwik",              nameAr: "سدويكش",         lat: 33.743628, lng: 10.919915 },
  DN088: { code: "DN088", nameFr: "Robana",              nameAr: "ربانة",          lat: 33.776235, lng: 10.894148 },
  DN097: { code: "DN097", nameFr: "El Hzem",             nameAr: "الحزم",          lat: 33.791238, lng: 10.926053 },
  DN060: { code: "DN060", nameFr: "Mahboubine",          nameAr: "المحبوبين",      lat: 33.796924, lng: 10.963092 },
  DN138: { code: "DN138", nameFr: "El Kantara (bridge)", nameAr: "قنطرة ميدون",    lat: 33.683474, lng: 10.917759 },
  DN078: { code: "DN078", nameFr: "Mhamid",              nameAr: "المحاميد",       lat: 33.697193, lng: 10.916439 },

  // ── Midoun / east ──────────────────────────────────────────────────────────
  DN000: { code: "DN000", nameFr: "Midoun",              nameAr: "وسط ميدون",      lat: 33.805323, lng: 10.990701 },
  DN023: { code: "DN023", nameFr: "El Maamoura",         nameAr: "المعمورة",       lat: 33.776720, lng: 11.034914 },
  DN054: { code: "DN054", nameFr: "Hôtel Dar Midoun",    nameAr: "نزل دار ميدون",  lat: 33.843008, lng: 10.995354 },
  DN044: { code: "DN044", nameFr: "Hôtel Dar Djerba",    nameAr: "نزل دار جربة",   lat: 33.826666, lng: 11.034551 },
};

function stops(...codes: string[]): SrtmStop[] {
  return codes.map((c) => {
    const s = SRTM_STATIONS[c];
    if (!s) throw new Error(`Unknown SRTM station: ${c}`);
    return s;
  });
}

/**
 * All 5 unique SRTM bus route paths on Djerba island.
 *
 * PATH A — RG1201 / RG5103 / RG7104
 *   Médenine / Tataouine ↔ El Jorf ↔ Ajim ↔ El Gara ↔ Houmt Souk ↔ El May ↔ Midoun
 *   Island stops: LF057 → AJ000 → AJ035 → HS000 → DN092 → DN000
 *
 * PATH B — RG2401 / RG3401 / RG7201
 *   Zarzis / Ben Guerdane / Tataouine ↔ El Kantara ↔ Sedwik ↔ Robana ↔ El May ↔ Houmt Souk
 *   Island stops: DN138 → DN075 → DN088 → DN092 → HS000
 *
 * PATH C — RG2403
 *   Zarzis ↔ El Kantara ↔ Sedwik ↔ Robana ↔ El May ↔ El Hzem ↔ Mahboubine ↔ Midoun
 *   Island stops: DN138 → DN075 → DN088 → DN092 → DN097 → DN060 → DN000
 *
 * PATH D — RG2501
 *   Zarzis ↔ El Kantara ↔ El Maamoura ↔ Midoun  (east-coast entry)
 *   Island stops: DN138 → DN023 → DN000
 *
 * PATH E — IU4501 / IU4502
 *   Houmt Souk → El Gara → Ajim → El Jorf → Najjar → Maghrawiya (mainland exit)
 *   Island stops: HS000 → AJ035 → AJ000 → LF057 → LF055 → LF052
 */
export const DJERBA_BUS_ROUTES: BusRoute[] = [
  {
    id: "PATH_A",
    refs: ["RG1201", "RG5103", "RG7104"],
    name: "El Jorf ↔ Houmt Souk ↔ Midoun",
    shortName: "A",
    color: "#0DD9C6",
    stops: stops("LF057", "AJ000", "AJ035", "HS000", "DN092", "DN000"),
  },
  {
    id: "PATH_B",
    refs: ["RG2401", "RG3401", "RG7201"],
    name: "El Kantara ↔ Houmt Souk",
    shortName: "B",
    color: "#3B82F6",
    stops: stops("DN138", "DN075", "DN088", "DN092", "HS000"),
  },
  {
    id: "PATH_C",
    refs: ["RG2403"],
    name: "El Kantara ↔ Midoun (via El May)",
    shortName: "C",
    color: "#F59E0B",
    stops: stops("DN138", "DN075", "DN088", "DN092", "DN097", "DN060", "DN000"),
  },
  {
    id: "PATH_D",
    refs: ["RG2501"],
    name: "El Kantara ↔ Midoun (east coast)",
    shortName: "D",
    color: "#A855F7",
    stops: stops("DN138", "DN023", "DN000"),
  },
  {
    id: "PATH_E",
    refs: ["IU4501", "IU4502"],
    name: "Houmt Souk → mainland (via Ajim ferry)",
    shortName: "E",
    color: "#EC4899",
    stops: stops("HS000", "AJ035", "AJ000", "LF057", "LF055", "LF052"),
  },
];
