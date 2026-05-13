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

export default function HelferMap({ mapRef, isTracking, clusters }: Props) {
  const colors = useColors();

  const s = StyleSheet.create({
    map: { flex: 1 },
    markerWrap: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 8,
      alignItems: "center",
      minWidth: 80,
      borderWidth: 1,
      borderColor: colors.primary + "55",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    markerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      color: colors.foreground,
      marginTop: 2,
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
      backgroundColor: colors.card + "F0",
      borderRadius: 10,
      padding: 10,
      gap: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendLine: {
      width: 18,
      height: 3,
      borderRadius: 2,
    },
    legendText: {
      fontFamily: "Inter_400Regular",
      fontSize: 10,
      color: colors.foreground,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...DJERBA_CENTER,
          latitudeDelta: 0.28,
          longitudeDelta: 0.28,
        }}
        showsUserLocation={isTracking}
        showsMyLocationButton={false}
      >
        {/* SRTM bus route polylines — stop coordinates from official dataset */}
        {DJERBA_BUS_ROUTES.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.stops.map((s) => ({
              latitude: s.lat,
              longitude: s.lng,
            }))}
            strokeColor={route.color}
            strokeWidth={3}
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
              fillColor={colors.primary + "2A"}
              strokeColor={colors.primary + "99"}
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
        {DJERBA_BUS_ROUTES.map((route) => (
          <View key={route.id} style={s.legendRow}>
            <View style={[s.legendLine, { backgroundColor: route.color }]} />
            <Text style={s.legendText}>
              {route.shortName} · {route.stops[0].nameFr} → {route.stops[route.stops.length - 1].nameFr}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
