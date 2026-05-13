import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { BusCluster } from "@workspace/api-client-react";

const DJERBA_CENTER = { lat: 33.87, lng: 10.85 };

interface Props {
  mapRef?: React.RefObject<any>;
  currentLat?: number;
  currentLng?: number;
  isTracking: boolean;
  clusters: BusCluster[];
}

function formatSpeed(kmh: number): string {
  if (kmh < 1) return "Stationary";
  return `${Math.round(kmh)} km/h`;
}

export default function HelferMap({ clusters, isTracking, currentLat, currentLng }: Props) {
  const colors = useColors();

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webMapBanner: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 14,
      alignItems: "center",
      gap: 6,
    },
    webMapText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    centerCoords: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
      fontVariant: ["tabular-nums"] as any,
    },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 10 },
    emptyWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    clusterCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    clusterHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    clusterIconBg: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.primary + "22",
      justifyContent: "center",
      alignItems: "center",
    },
    clusterTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
    },
    clusterConf: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.primary,
    },
    clusterGrid: {
      flexDirection: "row",
      gap: 8,
    },
    clusterStat: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      gap: 2,
    },
    clusterStatNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
      color: colors.foreground,
    },
    clusterStatLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.webMapBanner}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={s.webMapText}>
          Live map available in the Expo Go mobile app.{"\n"}
          Scan the QR code in the preview bar to open on your phone.
        </Text>
        {isTracking && currentLat != null && currentLng != null && (
          <Text style={s.centerCoords}>
            Your location: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </Text>
        )}
        {!isTracking && (
          <Text style={s.centerCoords}>
            Djerba center: {DJERBA_CENTER.lat}, {DJERBA_CENTER.lng}
          </Text>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {clusters.length === 0 ? (
          <View style={s.emptyWrap}>
            <Feather name="navigation" size={32} color={colors.border} />
            <Text style={s.emptyText}>
              No active bus clusters detected.{"\n"}Start sharing your location to help map buses.
            </Text>
          </View>
        ) : (
          clusters.map((cluster) => (
            <View key={cluster.clusterId} style={s.clusterCard}>
              <View style={s.clusterHeader}>
                <View style={s.clusterIconBg}>
                  <Feather name="navigation" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.clusterTitle}>Bus cluster</Text>
                  <Text style={s.clusterConf}>{cluster.confidence}% confidence</Text>
                </View>
              </View>
              <View style={s.clusterGrid}>
                <View style={s.clusterStat}>
                  <Text style={s.clusterStatNum}>{cluster.estimatedPassengers}</Text>
                  <Text style={s.clusterStatLabel}>passengers</Text>
                </View>
                <View style={s.clusterStat}>
                  <Text style={s.clusterStatNum}>{formatSpeed(cluster.avgSpeed)}</Text>
                  <Text style={s.clusterStatLabel}>speed</Text>
                </View>
                <View style={s.clusterStat}>
                  <Text style={s.clusterStatNum}>{cluster.lat.toFixed(3)}</Text>
                  <Text style={s.clusterStatLabel}>lat</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
