import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/context/TrackingContext";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isTracking, toggleTracking } = useTracking();
  const adminTapCount = useRef(0);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  function handleAdminTap() {
    adminTapCount.current++;
    if (adminTapCount.current >= 5) {
      adminTapCount.current = 0;
      setAdminUnlocked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function handleLogout() {
    if (Platform.OS === "web") {
      await logout();
      router.replace("/auth");
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  }

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 20,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
    },
    header: { marginBottom: 28 },
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
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: colors.primary + "22",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    phoneText: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    idText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
      fontVariant: ["tabular-nums"] as any,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 14,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    rowIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    rowSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    logoutBtn: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: "center",
      marginBottom: 24,
    },
    logoutText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.destructive,
    },
    disclaimer: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 18,
    },
    versionTap: {
      paddingVertical: 12,
      alignItems: "center",
    },
  });

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
          <Text style={s.headerSub}>Your contribution settings</Text>
        </View>

        <View style={s.avatar}>
          <Feather name="user" size={32} color={colors.primary} />
        </View>
        <Text style={s.phoneText}>{user?.phoneDisplay ?? "Anonymous"}</Text>
        <Text style={s.idText} numberOfLines={1}>
          ID: {user?.userId?.slice(0, 20) ?? "—"}
        </Text>

        <View style={{ height: 24 }} />

        <View style={s.section}>
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="radio" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Share location</Text>
              <Text style={s.rowSub}>
                {isTracking ? "Currently sharing" : "Tap to enable"}
              </Text>
            </View>
            <Switch
              value={isTracking}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTracking();
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isTracking ? colors.primaryForeground : colors.card}
            />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: "#10B98122" }]}>
              <Feather name="shield" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={s.rowLabel}>Privacy mode</Text>
              <Text style={s.rowSub}>Phone number is hashed, never stored raw</Text>
            </View>
          </View>
        </View>

        {adminUnlocked && (
          <View style={s.section}>
            <Pressable
              style={s.row}
              onPress={() => router.push("/admin" as any)}
            >
              <View style={[s.rowIcon, { backgroundColor: colors.accent + "22" }]}>
                <Feather name="terminal" size={18} color={colors.accent} />
              </View>
              <Text style={s.rowLabel}>Admin debug panel</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Sign out</Text>
        </Pressable>

        <Text style={s.disclaimer}>
          Helfer collects anonymous GPS data to infer bus routes in Djerba.
          {"\n"}No personal data is stored or shared.
        </Text>

        <Pressable style={s.versionTap} onPress={handleAdminTap}>
          <Text style={s.disclaimer}>Helfer MVP v0.1.0</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
