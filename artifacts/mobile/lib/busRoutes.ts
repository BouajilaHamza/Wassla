export interface BusRoute {
  id: string;
  name: string;
  shortName: string;
  color: string;
  stops: { name: string; lat: number; lng: number }[];
  waypoints: { lat: number; lng: number }[];
}

export const DJERBA_BUS_ROUTES: BusRoute[] = [
  {
    id: "R1",
    name: "Houmt Souk ↔ Midoun",
    shortName: "R1",
    color: "#0DD9C6",
    stops: [
      { name: "Houmt Souk (Place Hedi Chaker)", lat: 33.8765, lng: 10.8567 },
      { name: "Erriadh", lat: 33.8513, lng: 10.8937 },
      { name: "Mahboubine", lat: 33.8350, lng: 10.9296 },
      { name: "Midoun", lat: 33.8081, lng: 10.9912 },
    ],
    waypoints: [
      { lat: 33.8765, lng: 10.8567 },
      { lat: 33.8730, lng: 10.8620 },
      { lat: 33.8680, lng: 10.8720 },
      { lat: 33.8620, lng: 10.8850 },
      { lat: 33.8560, lng: 10.8930 },
      { lat: 33.8513, lng: 10.8937 },
      { lat: 33.8460, lng: 10.9050 },
      { lat: 33.8400, lng: 10.9180 },
      { lat: 33.8350, lng: 10.9296 },
      { lat: 33.8280, lng: 10.9470 },
      { lat: 33.8200, lng: 10.9640 },
      { lat: 33.8140, lng: 10.9760 },
      { lat: 33.8081, lng: 10.9912 },
    ],
  },
  {
    id: "R2",
    name: "Houmt Souk ↔ Ajim (Ferry)",
    shortName: "R2",
    color: "#3B82F6",
    stops: [
      { name: "Houmt Souk (Place Hedi Chaker)", lat: 33.8765, lng: 10.8567 },
      { name: "El Mahdia", lat: 33.8380, lng: 10.8210 },
      { name: "Guellala", lat: 33.7820, lng: 10.7810 },
      { name: "Ajim (Ferry Port)", lat: 33.7274, lng: 10.7455 },
    ],
    waypoints: [
      { lat: 33.8765, lng: 10.8567 },
      { lat: 33.8700, lng: 10.8510 },
      { lat: 33.8600, lng: 10.8430 },
      { lat: 33.8490, lng: 10.8330 },
      { lat: 33.8380, lng: 10.8210 },
      { lat: 33.8240, lng: 10.8090 },
      { lat: 33.8100, lng: 10.7990 },
      { lat: 33.7970, lng: 10.7890 },
      { lat: 33.7820, lng: 10.7810 },
      { lat: 33.7700, lng: 10.7680 },
      { lat: 33.7580, lng: 10.7570 },
      { lat: 33.7430, lng: 10.7490 },
      { lat: 33.7274, lng: 10.7455 },
    ],
  },
  {
    id: "R3",
    name: "Midoun ↔ Aghir",
    shortName: "R3",
    color: "#F59E0B",
    stops: [
      { name: "Midoun", lat: 33.8081, lng: 10.9912 },
      { name: "Sidi Mahres", lat: 33.7720, lng: 10.9720 },
      { name: "Aghir", lat: 33.6804, lng: 10.9186 },
    ],
    waypoints: [
      { lat: 33.8081, lng: 10.9912 },
      { lat: 33.7970, lng: 10.9870 },
      { lat: 33.7850, lng: 10.9810 },
      { lat: 33.7720, lng: 10.9720 },
      { lat: 33.7600, lng: 10.9620 },
      { lat: 33.7480, lng: 10.9520 },
      { lat: 33.7350, lng: 10.9420 },
      { lat: 33.7200, lng: 10.9330 },
      { lat: 33.7050, lng: 10.9270 },
      { lat: 33.6900, lng: 10.9220 },
      { lat: 33.6804, lng: 10.9186 },
    ],
  },
  {
    id: "R4",
    name: "Houmt Souk ↔ El Kantara (Bridge)",
    shortName: "R4",
    color: "#EC4899",
    stops: [
      { name: "Houmt Souk (Place Hedi Chaker)", lat: 33.8765, lng: 10.8567 },
      { name: "Cedghiane", lat: 33.8200, lng: 10.8550 },
      { name: "El Kantara (Bridge)", lat: 33.7213, lng: 10.8450 },
    ],
    waypoints: [
      { lat: 33.8765, lng: 10.8567 },
      { lat: 33.8680, lng: 10.8560 },
      { lat: 33.8580, lng: 10.8555 },
      { lat: 33.8480, lng: 10.8553 },
      { lat: 33.8380, lng: 10.8550 },
      { lat: 33.8280, lng: 10.8548 },
      { lat: 33.8200, lng: 10.8550 },
      { lat: 33.8100, lng: 10.8520 },
      { lat: 33.8000, lng: 10.8500 },
      { lat: 33.7900, lng: 10.8490 },
      { lat: 33.7800, lng: 10.8480 },
      { lat: 33.7700, lng: 10.8470 },
      { lat: 33.7600, lng: 10.8462 },
      { lat: 33.7500, lng: 10.8455 },
      { lat: 33.7400, lng: 10.8452 },
      { lat: 33.7300, lng: 10.8450 },
      { lat: 33.7213, lng: 10.8450 },
    ],
  },
];
