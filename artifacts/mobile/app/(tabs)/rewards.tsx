import { Feather } from "@expo/vector-icons";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetUserPoints } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/context/TrackingContext";

function RankBadge({ rank }: { rank: number }) {
  const colors = useColors();
  const labels: Record<number, { label: string; icon: string; color: string }> = {
    1: { label: "Pioneer", icon: "award", color: "#FFD700" },
    2: { label: "Mapper", icon: "map", color: "#C0C0C0" },
    3: { label: "Scout", icon: "compass", color: "#CD7F32" },
  };
  const info = labels[rank] ?? { label: `Rank #${rank}`, icon: "user", color: colors.primary };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Feather name={info.icon as any} size={16} color={info.color} />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: info.color,
        }}
      >
        {info.label}
      </Text>
    </View>
  );
}

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isTracking } = useTracking();

  const { data: pointsData, isLoading } = useGetUserPoints(
    { userId: user?.userId ?? "" },
    {
      query: {
        enabled: !!user,
        refetchInterval: 15000,
      },
    },
  );

  const points = pointsData?.points ?? 0;
  const tripsToday = pointsData?.tripsToday ?? 0;
  const rank = pointsData?.rank ?? 1;

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 20,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
    },
    header: {
      marginBottom: 28,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    headerSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
    },
    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      marginBottom: 16,
    },
    heroPoints: {
      fontSize: 64,
      fontFamily: "Inter_700Bold",
      color: colors.primaryForeground,
      letterSpacing: -2,
    },
    heroLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.primaryForeground + "CC",
      marginTop: 4,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    heroRank: {
      marginTop: 16,
      backgroundColor: colors.primaryForeground + "22",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNum: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 14,
    },
    ruleCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 24,
    },
    ruleRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 14,
    },
    ruleDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    ruleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    ruleName: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    ruleDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    rulePoints: {
      marginLeft: "auto" as any,
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    trackingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.primary + "18",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.primary + "44",
    },
    trackingText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      lineHeight: 19,
    },
  });

  const rules = [
    {
      icon: "radio",
      color: colors.primary,
      bg: colors.primary + "22",
      name: "Active tracking",
      desc: "Per minute of sharing",
      pts: "+1 pt",
    },
    {
      icon: "check-circle",
      color: "#10B981",
      bg: "#10B98122",
      name: "Bus confirmed",
      desc: "Confirm you're on a bus",
      pts: "+10 pts",
    },
  ];

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Rewards</Text>
          <Text style={s.headerSub}>Earn points by helping map Djerba buses</Text>
        </View>

        <View style={s.heroCard}>
          <Text style={s.heroPoints}>{isLoading ? "–" : points}</Text>
          <Text style={s.heroLabel}>Total Points</Text>
          <View style={s.heroRank}>
            <RankBadge rank={rank} />
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{tripsToday}</Text>
            <Text style={s.statLabel}>Trips today</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>#{rank}</Text>
            <Text style={s.statLabel}>Your rank</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>How to earn</Text>
        <View style={s.ruleCard}>
          {rules.map((rule, i) => (
            <View key={rule.name}>
              {i > 0 && <View style={s.ruleDivider} />}
              <View style={s.ruleRow}>
                <View style={[s.ruleIcon, { backgroundColor: rule.bg }]}>
                  <Feather name={rule.icon as any} size={18} color={rule.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ruleName}>{rule.name}</Text>
                  <Text style={s.ruleDesc}>{rule.desc}</Text>
                </View>
                <Text style={s.rulePoints}>{rule.pts}</Text>
              </View>
            </View>
          ))}
        </View>

        {!isTracking && (
          <View style={s.trackingBanner}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={s.trackingText}>
              Enable location sharing on the Map tab to start earning points.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
