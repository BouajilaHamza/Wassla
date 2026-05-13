import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetClusters, useConfirmCluster } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useTracking } from "@/context/TrackingContext";
import HelferMap from "@/components/HelferMap";

function formatSpeed(speedMs: number): string {
  const kmh = speedMs * 3.6;
  if (kmh < 1) return "Stationary";
  return `${Math.round(kmh)} km/h`;
}

function ConfirmModal({
  visible,
  clusterId,
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  clusterId: string | null;
  onConfirm: (isBus: boolean) => void;
  onDismiss: () => void;
}) {
  const colors = useColors();
  const { user } = useAuth();
  const { mutate: confirmCluster } = useConfirmCluster();

  function handleAnswer(isBus: boolean) {
    if (user && clusterId) {
      confirmCluster({ data: { userId: user.userId, clusterId, isBus } });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirm(isBus);
  }

  const s = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 28,
      paddingBottom: 44,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: colors.primary + "22",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      alignSelf: "center",
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    sub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 21,
    },
    row: { flexDirection: "row", gap: 12 },
    btnYes: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    btnNo: {
      flex: 1,
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    btnYesText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.primaryForeground },
    btnNoText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.foreground },
    dismiss: { alignSelf: "center", marginTop: 16, paddingVertical: 8, paddingHorizontal: 16 },
    dismissText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={s.overlay} onPress={onDismiss}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.iconWrap}>
            <Feather name="navigation" size={28} color={colors.primary} />
          </View>
          <Text style={s.title}>Are you on a bus?</Text>
          <Text style={s.sub}>
            You appear to be moving with a group.{"\n"}Your answer improves detection accuracy.
          </Text>
          <View style={s.row}>
            <Pressable style={s.btnYes} onPress={() => handleAnswer(true)}>
              <Text style={s.btnYesText}>Yes, on a bus</Text>
            </Pressable>
            <Pressable style={s.btnNo} onPress={() => handleAnswer(false)}>
              <Text style={s.btnNoText}>No</Text>
            </Pressable>
          </View>
          <Pressable style={s.dismiss} onPress={onDismiss}>
            <Text style={s.dismissText}>Ask me later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    isTracking,
    toggleTracking,
    currentLocation,
    inCluster,
    pendingClusterId,
    dismissCluster,
    confirmCluster,
  } = useTracking();
  const mapRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: clustersData, isLoading: clustersLoading } = useGetClusters({
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    if (inCluster && pendingClusterId) setShowConfirm(true);
  }, [inCluster, pendingClusterId]);

  useEffect(() => {
    if (!isTracking) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isTracking, pulseAnim]);

  const centerOnUser = useCallback(() => {
    if (currentLocation && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [currentLocation]);

  const clusters = clustersData?.clusters ?? [];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      position: "absolute",
      top: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      zIndex: 10,
    },
    titleCard: {
      flex: 1,
      backgroundColor: colors.card + "F2",
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleText: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground },
    subtitleText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    statsChip: {
      backgroundColor: colors.card + "F2",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: "center",
      minWidth: 58,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsNum: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    statsLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    bottomBar: {
      position: "absolute",
      bottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      zIndex: 10,
    },
    trackBtn: {
      flex: 1,
      height: 54,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    trackBtnActive: { backgroundColor: colors.primary },
    trackBtnInactive: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trackBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
    locBtn: {
      width: 54,
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={s.container}>
      <HelferMap
        mapRef={mapRef}
        currentLat={currentLocation?.lat}
        currentLng={currentLocation?.lng}
        isTracking={isTracking}
        clusters={clusters}
      />

      <View style={s.topBar}>
        <View style={s.titleCard}>
          <Text style={s.titleText}>Helfer</Text>
          <Text style={s.subtitleText}>
            {isTracking
              ? currentLocation
                ? `${formatSpeed(currentLocation.speed)} · Sharing`
                : "Getting location..."
              : "Tracking off"}
          </Text>
        </View>
        <View style={s.statsChip}>
          {clustersLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={s.statsNum}>{clusters.length}</Text>
          )}
          <Text style={s.statsLabel}>buses</Text>
        </View>
      </View>

      <View style={s.bottomBar}>
        <Pressable
          style={[s.trackBtn, isTracking ? s.trackBtnActive : s.trackBtnInactive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleTracking();
          }}
        >
          <Animated.View style={{ transform: [{ scale: isTracking ? pulseAnim : 1 }] }}>
            <Feather
              name={isTracking ? "radio" : "play"}
              size={20}
              color={isTracking ? colors.primaryForeground : colors.primary}
            />
          </Animated.View>
          <Text
            style={[
              s.trackBtnText,
              { color: isTracking ? colors.primaryForeground : colors.foreground },
            ]}
          >
            {isTracking ? "Sharing location" : "Start sharing"}
          </Text>
        </Pressable>

        <Pressable style={s.locBtn} onPress={centerOnUser}>
          <Feather name="crosshair" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showConfirm}
        clusterId={pendingClusterId}
        onConfirm={(isBus) => {
          setShowConfirm(false);
          confirmCluster(isBus);
        }}
        onDismiss={() => {
          setShowConfirm(false);
          dismissCluster();
        }}
      />
    </View>
  );
}
