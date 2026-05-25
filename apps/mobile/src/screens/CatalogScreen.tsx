import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { CategoryPill } from "../components/CategoryPill";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { RecipeCard } from "../components/RecipeCard";
import { ScreenShell } from "../components/ScreenShell";
import type { RootStackParamList } from "../navigation";
import { getCategories, getRecipes } from "../services/api";
import { colors, shadows } from "../theme";
import type { RecipeCategory, RecipeSummary } from "../types";

const PAGE_SIZE = 8;

export function CatalogScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const cardWidth = isWide ? "48%" : "100%";
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = page < totalPages;

  const loadCatalog = useCallback(
    async ({ nextPage = 1, append = false }: { nextPage?: number; append?: boolean } = {}) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);
        const [categoryItems, recipePage] = await Promise.all([
          categories.length === 0 ? getCategories() : Promise.resolve(categories),
          getRecipes({
            page: nextPage,
            pageSize: PAGE_SIZE,
            category: selectedCategory,
            search: searchTerm.trim() || undefined
          })
        ]);

        setCategories(categoryItems);
        setRecipes((currentRecipes) => (append ? [...currentRecipes, ...recipePage.items] : recipePage.items));
        setPage(recipePage.page);
        setTotalPages(recipePage.totalPages);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Каталогът не може да се зареди.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [categories, searchTerm, selectedCategory]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog({ nextPage: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [loadCatalog]);

  const categoryItems = useMemo(
    () => [{ name: "Всички", slug: "all", recipeCount: 0 }, ...categories],
    [categories]
  );

  return (
    <ScreenShell
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor={colors.brand}
          onRefresh={() => {
            setIsRefreshing(true);
            loadCatalog({ nextPage: 1 });
          }}
        />
      }
    >
      <View style={styles.headerPanel}>
        <Text style={styles.kicker}>Каталог</Text>
        <Text style={styles.title}>Избери рецепта за днес</Text>
        <Text style={styles.text}>
          Филтрирай по категория, потърси по дума и отвори детайлите с продуктите и стъпките.
        </Text>
        <TextInput
          autoCapitalize="none"
          clearButtonMode="while-editing"
          onChangeText={setSearchTerm}
          placeholder="Търси рецепта, категория или таг..."
          placeholderTextColor={colors.softText}
          style={styles.searchInput}
          value={searchTerm}
        />
      </View>

      <View style={styles.pills}>
        {categoryItems.map((category) => (
          <CategoryPill
            key={category.slug}
            label={category.name}
            onPress={() => setSelectedCategory(category.slug === "all" ? undefined : category.name)}
            selected={category.slug === "all" ? !selectedCategory : selectedCategory === category.name}
          />
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Зареждане на каталога...</Text>
        </View>
      ) : error ? (
        <EmptyState
          actionLabel="Опитай пак"
          onAction={() => loadCatalog({ nextPage: 1 })}
          text={error}
          title="Каталогът не е достъпен"
        />
      ) : recipes.length === 0 ? (
        <EmptyState
          actionLabel="Покажи всички"
          onAction={() => {
            setSearchTerm("");
            setSelectedCategory(undefined);
          }}
          text="Няма рецепти за избраните критерии. Пробвай друга дума или категория."
          title="Няма намерени рецепти"
        />
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Рецепти</Text>
            <Text style={styles.count}>{recipes.length} показани</Text>
          </View>
          <View style={[styles.grid, isWide ? styles.gridWide : null]}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.slug}
                onPress={() => navigation.navigate("RecipeDetails", { slug: recipe.slug })}
                recipe={recipe}
                style={[styles.recipeCard, { width: cardWidth }, isWide ? styles.recipeCardWide : null]}
              />
            ))}
          </View>
          {hasMore ? (
            <PrimaryButton
              label="Зареди още"
              loading={isLoadingMore}
              onPress={() => loadCatalog({ nextPage: page + 1, append: true })}
              style={styles.loadMore}
              variant="secondary"
            />
          ) : null}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerPanel: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 30,
    borderWidth: 1,
    padding: 20
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
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 8
  },
  text: {
    color: colors.cocoa,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 10
  },
  searchInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 18
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
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  count: {
    color: colors.softText,
    fontSize: 13,
    fontWeight: "800"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  gridWide: {
    justifyContent: "space-between"
  },
  recipeCard: {
    marginBottom: 2
  },
  recipeCardWide: {
    maxWidth: 390
  },
  loadMore: {
    marginTop: 18
  }
});
