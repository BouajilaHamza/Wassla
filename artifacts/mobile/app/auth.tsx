import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);

  const isValid = phone.replace(/\D/g, "").length >= 8;

  async function handleJoin() {
    if (!isValid) {
      setError("Enter a valid phone number (at least 8 digits)");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(phone);
      router.replace("/(tabs)/map");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 60,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
    },
    busIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary + "22",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 28,
    },
    title: {
      fontSize: 36,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -1,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 24,
      marginBottom: 48,
    },
    label: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      height: 52,
      fontFamily: "Inter_400Regular",
      fontSize: 17,
      color: colors.foreground,
    },
    error: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      marginBottom: 24,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      letterSpacing: 0.3,
    },
    disclaimer: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 20,
      lineHeight: 20,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>
        <View style={s.busIcon}>
          <Feather name="map-pin" size={32} color={colors.primary} />
        </View>

        <Text style={s.title}>Helfer</Text>
        <Text style={s.subtitle}>
          Help map Djerba buses anonymously.{"\n"}Share your location passively
          and earn points while improving transit for everyone.
        </Text>

        <Text style={s.label}>Phone number</Text>
        <View style={s.inputRow}>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError("");
            }}
            placeholder="+216 XX XXX XXX"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />
          {phone.length > 0 && (
            <Feather
              name="check-circle"
              size={20}
              color={isValid ? colors.primary : colors.border}
            />
          )}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Pressable
          style={[s.button, (!isValid || isLoading) && s.buttonDisabled]}
          onPress={handleJoin}
          disabled={!isValid || isLoading}
        >
          <Text style={s.buttonText}>
            {isLoading ? "Joining..." : "Join Helfer"}
          </Text>
        </Pressable>

        <Text style={s.disclaimer}>
          Your phone number is hashed locally.{"\n"}We never store or share
          your identity.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
