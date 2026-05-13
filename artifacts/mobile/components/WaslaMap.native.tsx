import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { DJERBA_BUS_ROUTES } from "@/lib/busRoutes";
import type { BusCluster } from "@workspace/api-client-react";

const DJERBA_CENTER = { latitude: 33.79, longitude: 10.87 };

interface Props {
  mapRef: React.RefObject<MapView | null>;
  currentLat?: number;
  currentLng?: number;
  isTracking: boolean;
  clusters: BusCluster[];
}

function formatSpeed(kmh: number): string {
  if (kmh < 1) return "Stopped";
  return `${Math.round(kmh)} km/h`;
}

export default function WaslaMap({ mapRef, isTracking, clusters }: Props) {
  const colors = useColors();

  const s = StyleSheet.create({
    map: { flex: 1 },
    markerWrap: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      alignItems: "center",
      minWidth: 88,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    markerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.foreground,
      marginTop: 3,
    },
    markerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 1,
    },
    stopDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: colors.card,
    },
    legend: {
      position: "absolute",
      bottom: 160,
      right: 12,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      gap: 7,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: 210,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    legendTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendTextWrap: { flex: 1 },
    legendPath: { fontFamily: "Inter_700Bold", fontSize: 10, color: colors.foreground },
    legendRefs: { fontFamily: "Inter_400Regular", fontSize: 9, color: colors.mutedForeground },
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...DJERBA_CENTER,
          latitudeDelta: 0.30,
          longitudeDelta: 0.30,
        }}
        showsUserLocation={isTracking}
        showsMyLocationButton={false}
      >
        {/* SRTM bus route polylines — all 5 unique island paths */}
        {DJERBA_BUS_ROUTES.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.stops.map((s) => ({
              latitude: s.lat,
              longitude: s.lng,
            }))}
            strokeColor={route.color}
            strokeWidth={3.5}
            lineDashPattern={[1]}
          />
        ))}

        {/* Bus stop markers */}
        {DJERBA_BUS_ROUTES.flatMap((route) =>
          route.stops.map((stop) => (
            <Marker
              key={`${route.id}-${stop.code}`}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
              title={stop.nameFr}
              description={stop.nameAr}
            >
              <View style={[s.stopDot, { backgroundColor: route.color }]} />
            </Marker>
          )),
        )}

        {/* Live cluster overlays */}
        {clusters.map((cluster) => (
          <View key={cluster.clusterId}>
            <Circle
              center={{ latitude: cluster.lat, longitude: cluster.lng }}
              radius={60}
              fillColor={colors.primary + "25"}
              strokeColor={colors.primary + "88"}
              strokeWidth={2}
            />
            <Marker
              coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
              tracksViewChanges={false}
            >
              <View style={s.markerWrap}>
                <Feather name="navigation" size={16} color={colors.primary} />
                <Text style={s.markerTitle}>{cluster.estimatedPassengers} pax</Text>
                <Text style={s.markerSub}>{formatSpeed(cluster.avgSpeed)}</Text>
                <Text style={s.markerSub}>{cluster.confidence}% conf.</Text>
              </View>
            </Marker>
          </View>
        ))}
      </MapView>

      {/* Route legend */}
      <View style={s.legend}>
        <Text style={s.legendTitle}>SRTM routes</Text>
        {DJERBA_BUS_ROUTES.map((route) => (
          <View key={route.id} style={s.legendRow}>
            <View style={[s.legendLine, { backgroundColor: route.color }]} />
            <View style={s.legendTextWrap}>
              <Text style={s.legendPath}>
                {route.shortName} · {route.stops[0].nameFr} → {route.stops[route.stops.length - 1].nameFr}
              </Text>
              <Text style={s.legendRefs}>{route.refs.join(" · ")}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
