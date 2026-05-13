import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { DJERBA_BUS_ROUTES } from "@/lib/busRoutes";
import type { BusCluster } from "@workspace/api-client-react";

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

export default function WaslaMap({ clusters, isTracking, currentLat, currentLng }: Props) {
  const colors = useColors();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    banner: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 14,
      alignItems: "center",
      gap: 5,
    },
    bannerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    bannerText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    coordText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.primary,
    },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 12 },
    sectionLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 2,
    },
    emptyWrap: {
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingVertical: 36,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    clusterCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    clusterHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    clusterIconBg: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primary + "18",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary + "30",
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
      marginTop: 2,
    },
    clusterGrid: { flexDirection: "row", gap: 8 },
    clusterStat: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      gap: 2,
    },
    clusterStatNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 15,
      color: colors.foreground,
    },
    clusterStatLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 10,
      color: colors.mutedForeground,
    },
    routeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    routeColorBar: { height: 3, width: "100%" },
    routeBody: { padding: 14, gap: 10 },
    routeHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    routePathBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    routePathText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
    routeInfo: { flex: 1 },
    routeName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 19,
    },
    routeRefsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 5 },
    refChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    refChipText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },
    stopsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 3 },
    stopItem: { flexDirection: "row", alignItems: "center", gap: 3 },
    stopDot: { width: 6, height: 6, borderRadius: 3 },
    stopText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    stopArrow: { fontSize: 10, color: colors.border, marginHorizontal: 1 },
    dataSource: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 4,
      lineHeight: 17,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.banner}>
        <View style={s.bannerRow}>
          <Feather name="smartphone" size={13} color={colors.mutedForeground} />
          <Text style={s.bannerText}>Live map available in Expo Go on your phone</Text>
        </View>
        {isTracking && currentLat != null && currentLng != null ? (
          <Text style={s.coordText}>
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </Text>
        ) : (
          <Text style={s.coordText}>Djerba island · 33.80°N, 10.87°E</Text>
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

        {/* All SRTM routes */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>
          SRTM routes · {DJERBA_BUS_ROUTES.reduce((n, r) => n + r.refs.length, 0)} lines · {DJERBA_BUS_ROUTES.length} island paths
        </Text>

        {DJERBA_BUS_ROUTES.map((route) => (
          <View key={route.id} style={s.routeCard}>
            <View style={[s.routeColorBar, { backgroundColor: route.color }]} />
            <View style={s.routeBody}>
              <View style={s.routeHeader}>
                <View style={[s.routePathBadge, { backgroundColor: route.color }]}>
                  <Text style={s.routePathText}>{route.shortName}</Text>
                </View>
                <View style={s.routeInfo}>
                  <Text style={s.routeName}>{route.name}</Text>
                  <View style={s.routeRefsRow}>
                    {route.refs.map((ref) => (
                      <View key={ref} style={[s.refChip, { backgroundColor: route.color + "CC" }]}>
                        <Text style={s.refChipText}>{ref}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.stopsRow}>
                {route.stops.map((stop, i) => (
                  <View key={stop.code} style={s.stopItem}>
                    <View style={[s.stopDot, { backgroundColor: route.color }]} />
                    <Text style={s.stopText}>{stop.nameFr}</Text>
                    {i < route.stops.length - 1 && (
                      <Text style={s.stopArrow}>›</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        <Text style={s.dataSource}>
          Station GPS: Tunisian Open Transport Data (catalogue-data.transport.tn){"\n"}
          Stop sequences: SRTM schedules XLSX — all 8 agency sheets
        </Text>
      </ScrollView>
    </View>
  );
}
