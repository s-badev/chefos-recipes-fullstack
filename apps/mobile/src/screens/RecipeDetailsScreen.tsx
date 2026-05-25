import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useNavigation, type NavigationProp, type RouteProp, useRoute } from "@react-navigation/native";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation";
import {
  addFavorite,
  getFavorites,
  getRecipeBySlug,
  removeFavorite
} from "../services/api";
import { colors, shadows } from "../theme";
import type { RecipeDetails } from "../types";

type DetailsRoute = RouteProp<RootStackParamList, "RecipeDetails">;

export function RecipeDetailsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DetailsRoute>();
  const { isAuthenticated, token } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [recipeDetails, favorites] = await Promise.all([
        getRecipeBySlug(route.params.slug),
        token ? getFavorites(token) : Promise.resolve([])
      ]);

      setRecipe(recipeDetails);
      setIsFavorite(favorites.some((item) => item.slug === recipeDetails.slug));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Рецептата не може да се зареди.");
    } finally {
      setIsLoading(false);
    }
  }, [route.params.slug, token]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  async function toggleFavorite() {
    if (!recipe || !token) {
      return;
    }

    try {
      setIsSaving(true);

      if (isFavorite) {
        await removeFavorite(token, recipe.slug);
        setIsFavorite(false);
      } else {
        await addFavorite(token, recipe.slug);
        setIsFavorite(true);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Любимите не могат да се обновят.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <ScreenShell>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Зареждане на рецептата...</Text>
        </View>
      </ScreenShell>
    );
  }

  if (error && !recipe) {
    return (
      <ScreenShell>
        <EmptyState actionLabel="Опитай пак" onAction={loadRecipe} text={error} title="Няма рецепта" />
      </ScreenShell>
    );
  }

  if (!recipe) {
    return (
      <ScreenShell>
        <EmptyState
          actionLabel="Към каталога"
          onAction={() => navigation.navigate("MainTabs", { screen: "Catalog" })}
          text="Избраната рецепта не беше намерена."
          title="Няма рецепта"
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Назад</Text>
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.imageWrap}>
          {recipe.imageUrl && !imageFailed ? (
            <Image
              accessibilityLabel={recipe.imageAlt ?? recipe.title}
              onError={() => setImageFailed(true)}
              source={{ uri: recipe.imageUrl }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackText}>{recipe.category}</Text>
            </View>
          )}
        </View>

        <View style={styles.heroBody}>
          <Text style={styles.category}>{recipe.category}</Text>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          <View style={styles.metaGrid}>
            <Meta label="Подготовка" value={`${recipe.prepTimeMinutes} мин`} />
            <Meta label="Готвене" value={`${recipe.cookTimeMinutes} мин`} />
            <Meta label="Порции" value={String(recipe.servings)} />
            <Meta label="Трудност" value={recipe.difficulty} />
          </View>
          {recipe.tags.length > 0 ? (
            <View style={styles.tags}>
              {recipe.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
          {isAuthenticated ? (
            <PrimaryButton
              label={isFavorite ? "Премахни от любими" : "Запази в любими"}
              loading={isSaving}
              onPress={toggleFavorite}
              style={styles.favoriteButton}
              variant={isFavorite ? "secondary" : "primary"}
            />
          ) : (
            <PrimaryButton
              label="Влез, за да запазиш"
              onPress={() => navigation.navigate("Login")}
              style={styles.favoriteButton}
              variant="secondary"
            />
          )}
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Продукти</Text>
        {recipe.ingredients.length > 0 ? (
          recipe.ingredients.map((ingredient) => (
            <View key={ingredient} style={styles.listRow}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{ingredient}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.listText}>Продуктите са описани в детайлите на рецептата.</Text>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Начин на приготвяне</Text>
        {recipe.steps.length > 0 ? (
          recipe.steps.map((step, index) => (
            <View key={`${index}-${step}`} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.listText}>Стъпките са подредени в описанието на рецептата.</Text>
        )}
      </View>
    </ScreenShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  backText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "900"
  },
  hero: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden"
  },
  imageWrap: {
    backgroundColor: colors.brandSoft,
    height: 230
  },
  image: {
    height: "100%",
    resizeMode: "cover",
    width: "100%"
  },
  imageFallback: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  imageFallbackText: {
    color: colors.brandDark,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  heroBody: {
    padding: 20
  },
  category: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
    marginTop: 14
  },
  description: {
    color: colors.cocoa,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 25,
    marginTop: 10
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  metaItem: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: "47%",
    padding: 12
  },
  metaLabel: {
    color: colors.softText,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  metaValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 5
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16
  },
  tag: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.cocoa,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  favoriteButton: {
    marginTop: 18
  },
  inlineError: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10
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
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 4
  },
  listRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  bullet: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 7,
    marginTop: 8,
    width: 7
  },
  listText: {
    color: colors.muted,
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 10
  },
  stepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  stepBadge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    marginTop: 6,
    width: 30
  },
  stepBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  loading: {
    alignItems: "center",
    padding: 32
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10
  }
});
