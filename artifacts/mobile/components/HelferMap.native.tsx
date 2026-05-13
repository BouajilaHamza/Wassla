import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { BusCluster } from "@workspace/api-client-react";

const DJERBA_CENTER = { latitude: 33.87, longitude: 10.85 };

interface Props {
  mapRef: React.RefObject<MapView | null>;
  currentLat?: number;
  currentLng?: number;
  isTracking: boolean;
  clusters: BusCluster[];
}

function formatSpeed(kmh: number): string {
  if (kmh < 1) return "Stationary";
  return `${Math.round(kmh)} km/h`;
}

export default function HelferMap({ mapRef, isTracking, clusters }: Props) {
  const colors = useColors();

  const s = StyleSheet.create({
    map: { flex: 1 },
    callout: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 8,
      alignItems: "center",
      minWidth: 80,
    },
    calloutTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: colors.foreground,
    },
    calloutSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
    },
  });

  return (
    <MapView
      ref={mapRef}
      style={s.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        ...DJERBA_CENTER,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
      showsUserLocation={isTracking}
      showsMyLocationButton={false}
    >
      {clusters.map((cluster) => (
        <View key={cluster.clusterId}>
          <Circle
            center={{ latitude: cluster.lat, longitude: cluster.lng }}
            radius={40}
            fillColor={colors.primary + "33"}
            strokeColor={colors.primary + "88"}
            strokeWidth={1.5}
          />
          <Marker
            coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
            tracksViewChanges={false}
          >
            <View style={s.callout}>
              <Feather name="navigation" size={18} color={colors.primary} />
              <Text style={s.calloutTitle}>{cluster.estimatedPassengers} pax</Text>
              <Text style={s.calloutSub}>{cluster.confidence}% conf.</Text>
              <Text style={s.calloutSub}>{formatSpeed(cluster.avgSpeed)}</Text>
            </View>
          </Marker>
        </View>
      ))}
    </MapView>
  );
}
