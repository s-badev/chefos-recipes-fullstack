import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation";
import { colors, shadows } from "../theme";

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Попълни имейл и парола.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login({ email: normalizedEmail, password });
      navigation.navigate("MainTabs", { screen: "Profile" });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Входът не беше успешен.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", { screen: "Home" });
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
        >
          <Text style={styles.backLabel}>← Назад</Text>
        </Pressable>
        <View style={styles.panel}>
          <Text style={styles.kicker}>Потребителски достъп</Text>
          <Text style={styles.title}>Вход</Text>
          <Text style={styles.text}>
            Влез в профила си, за да пазиш рецепти и да виждаш любимите си идеи.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.field}>
            <Text style={styles.label}>Имейл</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="ime@example.com"
              placeholderTextColor={colors.softText}
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Парола</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="Въведи парола"
              placeholderTextColor={colors.softText}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <PrimaryButton label="Вход" loading={isSubmitting} onPress={handleLogin} style={styles.button} />
          <PrimaryButton
            label="Създай профил"
            onPress={() => navigation.navigate("Register")}
            style={styles.secondaryButton}
            variant="secondary"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
          style={({ pressed }) => [styles.bottomLink, pressed ? styles.bottomLinkPressed : null]}
        >
          <Text style={styles.bottomLinkText}>Към началото</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 30,
    borderWidth: 1,
    padding: 22
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  backButtonPressed: {
    opacity: 0.85
  },
  backLabel: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "800"
  },
  kicker: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 8
  },
  text: {
    color: colors.cocoa,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 10
  },
  field: {
    marginTop: 16
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  button: {
    marginTop: 20
  },
  secondaryButton: {
    marginTop: 10
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#fecaca",
    borderRadius: 18,
    borderWidth: 1,
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 16,
    padding: 12
  },
  bottomLink: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 6,
    paddingVertical: 6
  },
  bottomLinkPressed: {
    opacity: 0.75
  },
  bottomLinkText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "800"
  }
});
