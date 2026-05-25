import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation";
import { colors, shadows } from "../theme";

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  if (isLoading) {
    return (
      <ScreenShell>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Проверка на профила...</Text>
        </View>
      </ScreenShell>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <ScreenShell>
        <EmptyState
          actionLabel="Вход"
          onAction={() => navigation.navigate("Login")}
          text="Влез или създай профил, за да пазиш любими рецепти и да ги виждаш на всяко устройство."
          title="Профилът пази любимите ти рецепти"
        />
        <PrimaryButton
          label="Регистрация"
          onPress={() => navigation.navigate("Register")}
          style={styles.secondaryAction}
          variant="secondary"
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Профил</Text>
        <Text style={styles.title}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Потребителски профил</Text>
      </View>

      <View style={styles.shortcuts}>
        <PrimaryButton
          label="Каталог"
          onPress={() => navigation.navigate("MainTabs", { screen: "Catalog" })}
          style={styles.shortcutButton}
        />
        <PrimaryButton
          label="Любими"
          onPress={() => navigation.navigate("MainTabs", { screen: "Favorites" })}
          style={styles.shortcutButton}
          variant="secondary"
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Лична зона</Text>
        <Text style={styles.text}>
          От профила можеш да отваряш каталога, да преглеждаш любимите рецепти и да излизаш от
          мобилната сесия.
        </Text>
      </View>

      <PrimaryButton label="Изход" onPress={logout} style={styles.logoutButton} variant="danger" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    padding: 32
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10
  },
  hero: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 30,
    borderWidth: 1,
    padding: 22
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
  email: {
    color: colors.cocoa,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8
  },
  role: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    color: colors.brandDark,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 14,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  shortcuts: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16
  },
  shortcutButton: {
    flex: 1
  },
  panel: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    padding: 18
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  text: {
    color: colors.cocoa,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 8
  },
  logoutButton: {
    marginTop: 18
  },
  secondaryAction: {
    marginTop: 14
  }
});
