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
      paddingHorizontal: 32,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 56,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
    },
    wordmarkWrap: {
      marginBottom: 40,
    },
    wordmark: {
      fontSize: 48,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      letterSpacing: -2,
    },
    wordmarkAr: {
      fontSize: 17,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
      letterSpacing: 1,
    },
    divider: {
      width: 36,
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: 1,
      marginTop: 16,
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 25,
    },
    spacer: { flex: 1 },
    label: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 1.2,
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
      paddingHorizontal: 18,
      marginBottom: 14,
    },
    inputRowFocus: {
      borderColor: colors.primary,
    },
    input: {
      flex: 1,
      height: 56,
      fontFamily: "Inter_400Regular",
      fontSize: 17,
      color: colors.foreground,
    },
    validDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    error: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 58,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 4,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    disclaimer: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 20,
      lineHeight: 19,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>
        <View style={s.wordmarkWrap}>
          <Text style={s.wordmark}>Wasla</Text>
          <Text style={s.wordmarkAr}>وصلة · Connecting Djerba</Text>
          <View style={s.divider} />
          <Text style={s.subtitle}>
            Help map Djerba's buses anonymously.{"\n"}Share your location passively and earn points while improving transit for everyone.
          </Text>
        </View>

        <View style={s.spacer} />

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
            placeholderTextColor={colors.mutedForeground + "88"}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />
          {isValid && <View style={s.validDot} />}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Pressable
          style={[s.button, (!isValid || isLoading) && s.buttonDisabled]}
          onPress={handleJoin}
          disabled={!isValid || isLoading}
        >
          <Text style={s.buttonText}>
            {isLoading ? "Joining…" : "Join Wasla"}
          </Text>
        </Pressable>

        <Text style={s.disclaimer}>
          Your phone number is hashed locally.{"\n"}We never store or share your identity.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
