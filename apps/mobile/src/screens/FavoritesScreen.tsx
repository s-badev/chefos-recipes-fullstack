import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useFocusEffect, useNavigation, type NavigationProp } from "@react-navigation/native";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { RecipeCard } from "../components/RecipeCard";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation";
import { getFavorites, removeFavorite } from "../services/api";
import { colors } from "../theme";
import type { RecipeSummary } from "../types";

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, token } = useAuth();
  const [favorites, setFavorites] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const items = await getFavorites(token);

      setFavorites(items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Любимите не могат да се заредят.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  async function handleRemove(slug: string) {
    if (!token) {
      return;
    }

    try {
      setRemovingSlug(slug);
      await removeFavorite(token, slug);
      setFavorites((current) => current.filter((recipe) => recipe.slug !== slug));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Рецептата не може да се премахне.");
    } finally {
      setRemovingSlug(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <ScreenShell>
        <EmptyState
          actionLabel="Вход в профила"
          onAction={() => navigation.navigate("Login")}
          text="Влез в профила си, за да виждаш и управляваш запазените рецепти."
          title="Любимите са към профила"
        />
        <PrimaryButton
          label="Разгледай каталога"
          onPress={() => navigation.navigate("MainTabs", { screen: "Catalog" })}
          style={styles.guestCatalogButton}
          variant="secondary"
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.brand}
          onRefresh={() => {
            setIsRefreshing(true);
            loadFavorites();
          }}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Любими рецепти</Text>
        <Text style={styles.title}>Запазени идеи</Text>
        <Text style={styles.text}>Твоите любими рецепти са тук за бързо връщане към тях.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && favorites.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Зареждане на любими...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <EmptyState
          actionLabel="Към каталога"
          onAction={() => navigation.navigate("MainTabs", { screen: "Catalog" })}
          text="Все още нямаш запазени рецепти. Отвори рецепта и я добави в любими."
          title="Няма запазени рецепти"
        />
      ) : (
        <View style={styles.list}>
          {favorites.map((recipe) => (
            <View key={recipe.slug} style={styles.favoriteItem}>
              <RecipeCard
                onPress={() => navigation.navigate("RecipeDetails", { slug: recipe.slug })}
                recipe={recipe}
              />
              <PrimaryButton
                label="Премахни"
                loading={removingSlug === recipe.slug}
                onPress={() => handleRemove(recipe.slug)}
                style={styles.removeButton}
                variant="secondary"
              />
            </View>
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18
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
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
    marginTop: 8
  },
  text: {
    color: colors.cocoa,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 8
  },
  list: {
    gap: 16
  },
  favoriteItem: {
    gap: 10
  },
  removeButton: {
    alignSelf: "flex-end",
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  loading: {
    alignItems: "center",
    padding: 28
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
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
    marginBottom: 14,
    padding: 12
  },
  guestCatalogButton: {
    marginTop: 14
  }
});
