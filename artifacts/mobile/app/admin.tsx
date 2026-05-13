import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetAdminStats, useGetClusters } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors = useColors();
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 6,
    }}>
      <Feather name={icon as any} size={18} color={color} />
      <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: colors.foreground }}>{value}</Text>
      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{label}</Text>
    </View>
  );
}

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStats({
    query: { refetchInterval: 5000 },
  });
  const { data: clustersData, refetch: refetchClusters } = useGetClusters({
    query: { refetchInterval: 5000 },
  });

  const clusters = clustersData?.clusters ?? [];

  function handleRefresh() {
    refetchStats();
    refetchClusters();
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 16,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40,
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    backText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 6,
    },
    sub: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 20,
    },
    gridRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginTop: 20,
      marginBottom: 12,
    },
    clusterCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
    },
    clusterRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    clusterTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
    },
    clusterConf: {
      fontFamily: "Inter_700Bold",
      fontSize: 13,
      color: colors.primary,
    },
    clusterSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={statsLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Pressable style={s.backRow} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.primary} />
          <Text style={s.backText}>Back</Text>
        </Pressable>

        <Text style={s.title}>Debug Panel</Text>
        <Text style={s.sub}>Live cluster detection stats · MVP only</Text>

        <View style={s.gridRow}>
          <StatCard label="Active users" value={stats?.activeUsers ?? 0} icon="users" color={colors.primary} />
          <StatCard label="Active clusters" value={stats?.activeClusters ?? 0} icon="navigation" color="#10B981" />
        </View>
        <View style={s.gridRow}>
          <StatCard label="Total pings" value={stats?.totalLocationPings ?? 0} icon="map-pin" color={colors.accent} />
          <StatCard label="Avg confidence" value={`${stats?.avgConfidence ?? 0}%`} icon="percent" color="#F59E0B" />
        </View>

        <Text style={s.sectionTitle}>Active clusters ({clusters.length})</Text>

        {clusters.length === 0 ? (
          <View style={[s.clusterCard, { alignItems: "center", padding: 24 }]}>
            <Feather name="inbox" size={24} color={colors.mutedForeground} />
            <Text style={[s.clusterSub, { marginTop: 8 }]}>No active clusters</Text>
          </View>
        ) : (
          clusters.map((c) => (
            <View key={c.clusterId} style={s.clusterCard}>
              <View style={s.clusterRow}>
                <Text style={s.clusterTitle}>{c.clusterId.slice(0, 20)}</Text>
                <Text style={s.clusterConf}>{c.confidence}%</Text>
              </View>
              <Text style={s.clusterSub}>
                {c.lat.toFixed(5)}, {c.lng.toFixed(5)} · {Math.round(c.avgSpeed)} km/h · {c.estimatedPassengers} pax
              </Text>
              <Text style={s.clusterSub}>
                Updated: {new Date(c.updatedAt).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
