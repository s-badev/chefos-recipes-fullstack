import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { RecipeCard } from "../components/RecipeCard";
import { ScreenShell } from "../components/ScreenShell";
import type { RootStackParamList } from "../navigation";
import { getRecipes } from "../services/api";
import { colors, shadows } from "../theme";
import type { RecipeSummary } from "../types";

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [featuredRecipes, setFeaturedRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedRecipes() {
      try {
        setError(null);
        const data = await getRecipes({ page: 1, pageSize: 4 });

        if (isMounted) {
          setFeaturedRecipes(data.items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Рецептите не могат да се заредят.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeaturedRecipes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Chefo's Recipes</Text>
        <Text style={styles.title}>Домашни рецепти, подредени спокойно</Text>
        <Text style={styles.text}>
          Разглеждай български рецепти, избирай по категория и пази любимите идеи за по-късно.
        </Text>
        <PrimaryButton
          label="Към каталога"
          onPress={() => navigation.navigate("MainTabs", { screen: "Catalog" })}
          style={styles.heroButton}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Подбрани рецепти</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Зареждане на рецепти...</Text>
        </View>
      ) : error ? (
        <EmptyState
          actionLabel="Опитай пак"
          onAction={() => {
            setIsLoading(true);
            setError(null);
            getRecipes({ page: 1, pageSize: 4 })
              .then((data) => setFeaturedRecipes(data.items))
              .catch((loadError) =>
                setError(loadError instanceof Error ? loadError.message : "Рецептите не могат да се заредят.")
              )
              .finally(() => setIsLoading(false));
          }}
          text={error}
          title="Няма връзка с каталога"
        />
      ) : (
        <View style={[styles.list, isWide ? styles.listWide : null]}>
          {featuredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              onPress={() => navigation.navigate("RecipeDetails", { slug: recipe.slug })}
              recipe={recipe}
              style={isWide ? styles.featureCard : undefined}
            />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    marginTop: 10
  },
  text: {
    color: colors.cocoa,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 12
  },
  heroButton: {
    marginTop: 20
  },
  sectionHeader: {
    marginBottom: 4,
    marginTop: 24
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  list: {
    gap: 16
  },
  listWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  featureCard: {
    maxWidth: 390,
    width: "48%"
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
  }
});
