import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { DJERBA_BUS_ROUTES } from "@/lib/busRoutes";
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
    container: { flex: 1, backgroundColor: colors.background },
    webMapBanner: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    webMapRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    webMapText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    coordText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
      fontVariant: ["tabular-nums"] as any,
    },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 12 },
    sectionLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    emptyWrap: {
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 21,
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
      marginBottom: 10,
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
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.primary,
      marginTop: 1,
    },
    clusterGrid: { flexDirection: "row", gap: 8 },
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
    routeCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    routeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    routeBar: { width: 4, height: 22, borderRadius: 2 },
    routeName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
    },
    routeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    routeBadgeText: {
      fontFamily: "Inter_700Bold",
      fontSize: 11,
      color: "#fff",
    },
    stopsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    stopChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.background,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    stopDot: { width: 6, height: 6, borderRadius: 3 },
    stopText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.webMapBanner}>
        <View style={s.webMapRow}>
          <Feather name="smartphone" size={13} color={colors.mutedForeground} />
          <Text style={s.webMapText}>Live map available in Expo Go on your phone</Text>
        </View>
        {isTracking && currentLat != null && currentLng != null ? (
          <Text style={s.coordText}>
            Your location: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </Text>
        ) : (
          <Text style={s.coordText}>
            Djerba: {DJERBA_CENTER.lat}°N, {DJERBA_CENTER.lng}°E
          </Text>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Live clusters */}
        <Text style={s.sectionLabel}>Live bus clusters</Text>
        {clusters.length === 0 ? (
          <View style={s.emptyWrap}>
            <Feather name="navigation" size={28} color={colors.border} />
            <Text style={s.emptyText}>
              No active clusters detected.{"\n"}Start sharing your location to help detect buses.
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
                  <Text style={s.clusterTitle}>Bus cluster detected</Text>
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
                  <Text style={s.clusterStatLabel}>avg speed</Text>
                </View>
                <View style={s.clusterStat}>
                  <Text style={s.clusterStatNum}>
                    {cluster.lat.toFixed(3)},{cluster.lng.toFixed(3)}
                  </Text>
                  <Text style={s.clusterStatLabel}>position</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Known routes */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>SRTGN bus routes — Djerba</Text>
        {DJERBA_BUS_ROUTES.map((route) => (
          <View key={route.id} style={s.routeCard}>
            <View style={s.routeHeader}>
              <View style={[s.routeBar, { backgroundColor: route.color }]} />
              <Text style={s.routeName}>{route.name}</Text>
              <View style={[s.routeBadge, { backgroundColor: route.color }]}>
                <Text style={s.routeBadgeText}>{route.shortName}</Text>
              </View>
            </View>
            <View style={s.stopsRow}>
              {route.stops.map((stop, i) => (
                <View key={stop.name} style={s.stopChip}>
                  <View style={[s.stopDot, { backgroundColor: route.color }]} />
                  <Text style={s.stopText}>{stop.name.split(" (")[0]}</Text>
                  {i < route.stops.length - 1 && (
                    <Feather name="chevron-right" size={10} color={colors.border} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
