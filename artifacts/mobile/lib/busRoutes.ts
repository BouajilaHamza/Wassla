/**
 * SRTM (Société Régionale de Transport de Médenine) bus routes on Djerba island.
 *
 * Station coordinates sourced from the official Tunisian Open Transport dataset:
 * https://catalogue-data.transport.tn/dataset/liste-des-stations-de-la-srtm-et-leurs-positions-geographiques
 *
 * Route stop sequences sourced from SRTM schedules dataset:
 * https://catalogue-data.transport.tn/dataset/horaires-des-bus-de-la-srtm
 *
 * Downloaded and parsed from the official data files (stations.csv + schedules.xlsx).
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
  ref: string;
  name: string;
  shortName: string;
  color: string;
  stops: SrtmStop[];
}

/**
 * Real SRTM station coordinates from the official dataset.
 * Only stations located on Djerba island (bbox: lat 33.65–33.95, lng 10.60–11.10).
 */
export const SRTM_STATIONS: Record<string, SrtmStop> = {
  HS000: { code: "HS000", nameFr: "Houmt Souk",          nameAr: "حومة السوق",   lat: 33.872243, lng: 10.857974 },
  AJ035: { code: "AJ035", nameFr: "El Gara",             nameAr: "القرع",         lat: 33.807494, lng: 10.789568 },
  AJ000: { code: "AJ000", nameFr: "Ajim (ferry port)",   nameAr: "أجيم",          lat: 33.725348, lng: 10.748368 },
  LF057: { code: "LF057", nameFr: "El Jorf",             nameAr: "الجرف",         lat: 33.696711, lng: 10.731952 },
  LF055: { code: "LF055", nameFr: "Najjar (mosque)",     nameAr: "النجار",        lat: 33.681407, lng: 10.680385 },
  LF052: { code: "LF052", nameFr: "Maghrawiya",          nameAr: "المغراوية",     lat: 33.655848, lng: 10.621198 },
  DN092: { code: "DN092", nameFr: "El May",              nameAr: "الماي",         lat: 33.801846, lng: 10.885065 },
  DN088: { code: "DN088", nameFr: "Robana",              nameAr: "ربانة",         lat: 33.776235, lng: 10.894148 },
  DN097: { code: "DN097", nameFr: "El Hzem",             nameAr: "الحزم",         lat: 33.791238, lng: 10.926053 },
  DN060: { code: "DN060", nameFr: "Mahboubine",          nameAr: "المحبوبين",     lat: 33.796924, lng: 10.963092 },
  DN000: { code: "DN000", nameFr: "Midoun",              nameAr: "وسط ميدون",     lat: 33.805323, lng: 10.990701 },
  DN023: { code: "DN023", nameFr: "El Maamoura",         nameAr: "المعمورة",      lat: 33.776720, lng: 11.034914 },
  DN075: { code: "DN075", nameFr: "Sedwik",              nameAr: "سدويكش",        lat: 33.743628, lng: 10.919915 },
  DN138: { code: "DN138", nameFr: "El Kantara (bridge)", nameAr: "قنطرة ميدون",   lat: 33.683474, lng: 10.917759 },
  DN078: { code: "DN078", nameFr: "Mhamid",              nameAr: "المحاميد",      lat: 33.697193, lng: 10.916439 },
};

function stops(...codes: string[]): SrtmStop[] {
  return codes.map((c) => {
    const s = SRTM_STATIONS[c];
    if (!s) throw new Error(`Unknown SRTM station code: ${c}`);
    return s;
  });
}

/**
 * The 4 SRTM bus routes operating on Djerba island.
 *
 * RG1201 / RG5103  Ajim ↔ Houmt Souk ↔ Midoun
 *   Source rows: sheet "وكالة مدنين" (RG1201) and "وكالة ميدون" (RG5103)
 *   Stop sequence (island section): AJ000 → AJ035 → HS000 → DN092 → DN000
 *
 * RG2401  El Kantara ↔ Houmt Souk  (Zarzis line, island section)
 *   Source rows: sheet "وكالة جرجيس" (RG2401)
 *   Stop sequence: DN138 → DN075 → DN088 → DN092 → HS000
 *
 * RG2403  El Kantara ↔ Midoun via El May  (Zarzis line, island section)
 *   Source rows: sheet "وكالة جرجيس" (RG2403)
 *   Stop sequence: DN138 → DN075 → DN088 → DN092 → DN097 → DN060 → DN000
 *
 * IU4501  Houmt Souk → El Jorf (exits island via Ajim ferry)
 *   Source rows: sheet "وكالة ح السوق" (IU4501)
 *   Stop sequence: HS000 → AJ035 → AJ000 → LF057 → LF055 → LF052
 */
export const DJERBA_BUS_ROUTES: BusRoute[] = [
  {
    id: "RG1201",
    ref: "RG1201/5103",
    name: "Ajim ↔ Houmt Souk ↔ Midoun",
    shortName: "R1",
    color: "#0DD9C6",
    stops: stops("AJ000", "AJ035", "HS000", "DN092", "DN000"),
  },
  {
    id: "RG2401",
    ref: "RG2401",
    name: "El Kantara ↔ Houmt Souk",
    shortName: "R2",
    color: "#3B82F6",
    stops: stops("DN138", "DN075", "DN088", "DN092", "HS000"),
  },
  {
    id: "RG2403",
    ref: "RG2403",
    name: "El Kantara ↔ Midoun (via El May)",
    shortName: "R3",
    color: "#F59E0B",
    stops: stops("DN138", "DN075", "DN088", "DN092", "DN097", "DN060", "DN000"),
  },
  {
    id: "IU4501",
    ref: "IU4501",
    name: "Houmt Souk → El Jorf (mainland exit)",
    shortName: "R4",
    color: "#EC4899",
    stops: stops("HS000", "AJ035", "AJ000", "LF057", "LF055", "LF052"),
  },
];
