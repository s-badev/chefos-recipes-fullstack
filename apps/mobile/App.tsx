import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Recipe = {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: string[];
  steps: string[];
};

type ViewMode = "recipes" | "details" | "categories" | "favorites" | "login" | "register" | "profile";

const recipes: Recipe[] = [
  {
    title: "Шопска салата",
    slug: "shopska-salad",
    description: "Свежа класика с домати, краставици, печени чушки, магданоз и сирене.",
    category: "Салати",
    difficulty: "Лесна",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    ingredients: [
      "4 зрели домата",
      "1 краставица",
      "2 печени червени чушки",
      "150 г бяло сирене",
      "Магданоз, олио, оцет и сол"
    ],
    steps: [
      "Нарежи доматите, краставицата, чушките и магданоза.",
      "Овкуси с олио, оцет и сол.",
      "Настържи сиренето отгоре и сервирай веднага."
    ]
  },
  {
    title: "Баница със сирене",
    slug: "banitsa-with-sirene",
    description: "Фини кори с яйца, кисело мляко и сирене, изпечени до златисто.",
    category: "Тестени",
    difficulty: "Средна",
    prepTimeMinutes: 25,
    cookTimeMinutes: 40,
    servings: 8,
    ingredients: [
      "500 г кори за баница",
      "350 г бяло сирене",
      "4 яйца",
      "250 г кисело мляко",
      "Олио и малко масло"
    ],
    steps: [
      "Разбий яйцата с киселото мляко и малко олио.",
      "Редувай кори, плънка и натрошено сирене в намаслена тава.",
      "Печи на 180 градуса до златиста коричка."
    ]
  },
  {
    title: "Кавърма със свинско",
    slug: "kavarma-pork-stew",
    description: "Крехко свинско с чушки, гъби, домати, вино и чубрица.",
    category: "Основни",
    difficulty: "Средна",
    prepTimeMinutes: 25,
    cookTimeMinutes: 75,
    servings: 4,
    ingredients: [
      "700 г свинска плешка",
      "2 глави лук",
      "2 червени чушки",
      "250 г гъби",
      "Домати, бяло вино и чубрица"
    ],
    steps: [
      "Запечати свинското в загрято олио.",
      "Добави лук, чушки и гъби и готви до омекване.",
      "Сложи домати, вино и подправки, после остави да къкри до готовност."
    ]
  },
  {
    title: "Таратор",
    slug: "tarator",
    description: "Охладена супа с кисело мляко, краставица, чесън, копър и орехи.",
    category: "Супи",
    difficulty: "Лесна",
    prepTimeMinutes: 15,
    cookTimeMinutes: 0,
    servings: 4,
    ingredients: [
      "500 г кисело мляко",
      "1 краставица",
      "2 скилидки чесън",
      "Копър, орехи, олио и сол"
    ],
    steps: [
      "Разбий киселото мляко със студена вода.",
      "Добави краставица, чесън, копър и орехи.",
      "Охлади преди сервиране."
    ]
  }
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("recipes");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.category === selectedCategory);
  }, [selectedCategory]);

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setViewMode("details");
  }

  function openCategory(category: string | null) {
    setSelectedCategory(category);
    setViewMode("recipes");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <Text style={styles.brand}>Chefo's Recipes</Text>
          <Text style={styles.headerTitle}>{getHeaderTitle(viewMode)}</Text>
        </View>

        {viewMode === "details" ? (
          <DetailsView recipe={selectedRecipe} onBack={() => setViewMode("recipes")} />
        ) : viewMode === "categories" ? (
          <CategoriesView recipes={recipes} selectedCategory={selectedCategory} onSelectCategory={openCategory} />
        ) : viewMode === "favorites" ? (
          <FavoritesView onBrowse={() => setViewMode("recipes")} />
        ) : viewMode === "login" ? (
          <LoginView onRegister={() => setViewMode("register")} />
        ) : viewMode === "register" ? (
          <RegisterView onLogin={() => setViewMode("login")} />
        ) : viewMode === "profile" ? (
          <ProfileView onLogin={() => setViewMode("login")} onRegister={() => setViewMode("register")} />
        ) : (
          <RecipesView
            recipes={filteredRecipes}
            selectedCategory={selectedCategory}
            onClearCategory={() => setSelectedCategory(null)}
            onSelectRecipe={openRecipe}
          />
        )}

        <View style={styles.tabBar}>
          <TabButton
            isActive={viewMode === "recipes" || viewMode === "details"}
            label="Рецепти"
            onPress={() => setViewMode("recipes")}
          />
          <TabButton
            isActive={viewMode === "categories"}
            label="Категории"
            onPress={() => setViewMode("categories")}
          />
          <TabButton
            isActive={viewMode === "favorites"}
            label="Любими"
            onPress={() => setViewMode("favorites")}
          />
          <TabButton
            isActive={viewMode === "profile" || viewMode === "login" || viewMode === "register"}
            label="Профил"
            onPress={() => setViewMode("profile")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function getHeaderTitle(viewMode: ViewMode) {
  const titles: Record<ViewMode, string> = {
    recipes: "Рецепти",
    details: "Детайли",
    categories: "Категории",
    favorites: "Любими",
    login: "Вход",
    register: "Регистрация",
    profile: "Профил"
  };

  return titles[viewMode];
}

function RecipesView({
  recipes,
  selectedCategory,
  onClearCategory,
  onSelectRecipe
}: {
  recipes: Recipe[];
  selectedCategory: string | null;
  onClearCategory: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Български рецепти</Text>
        <Text style={styles.heroTitle}>Избери нещо вкусно за днес</Text>
        <Text style={styles.heroText}>
          Мобилна основа за разглеждане на рецепти, категории, любими и бъдещ профил.
        </Text>
      </View>

      {selectedCategory ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterText}>Филтър: {selectedCategory}</Text>
          <Pressable onPress={onClearCategory}>
            <Text style={styles.filterAction}>Покажи всички</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Рецепти</Text>
        <Text style={styles.sectionMeta}>{recipes.length} примерни</Text>
      </View>

      {recipes.map((recipe) => (
        <Pressable key={recipe.slug} onPress={() => onSelectRecipe(recipe)} style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.pill}>{recipe.category}</Text>
            <Text style={styles.difficulty}>{recipe.difficulty}</Text>
          </View>
          <Text style={styles.cardTitle}>{recipe.title}</Text>
          <Text style={styles.cardText}>{recipe.description}</Text>
          <View style={styles.metaGrid}>
            <MetaItem label="Подготовка" value={`${recipe.prepTimeMinutes} мин`} />
            <MetaItem label="Готвене" value={`${recipe.cookTimeMinutes} мин`} />
            <MetaItem label="Порции" value={`${recipe.servings}`} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function CategoriesView({
  recipes,
  selectedCategory,
  onSelectCategory
}: {
  recipes: Recipe[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}) {
  const categories = Array.from(new Set(recipes.map((recipe) => recipe.category))).map((category) => ({
    name: category,
    count: recipes.filter((recipe) => recipe.category === category).length
  }));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Категории</Text>
        <Text style={styles.heroTitle}>Намери рецепта по настроение</Text>
        <Text style={styles.heroText}>
          Избери категория, за да филтрираш локалния списък с примерни рецепти.
        </Text>
      </View>

      <Pressable onPress={() => onSelectCategory(null)} style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitleSmall}>Всички рецепти</Text>
          <Text style={styles.pill}>{recipes.length}</Text>
        </View>
        <Text style={styles.cardText}>Премахва филтъра и показва целия примерен каталог.</Text>
      </Pressable>

      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;

        return (
          <Pressable
            key={category.name}
            onPress={() => onSelectCategory(category.name)}
            style={[styles.card, isSelected && styles.cardSelected]}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitleSmall}>{category.name}</Text>
              <Text style={styles.pill}>{category.count} рецепти</Text>
            </View>
            <Text style={styles.cardText}>
              Примерна категория за бъдещо API филтриране и странициране на списъците.
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function DetailsView({ recipe, onBack }: { recipe: Recipe; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Обратно</Text>
      </Pressable>

      <View style={styles.detailsHero}>
        <Text style={styles.pill}>{recipe.category}</Text>
        <Text style={styles.detailsTitle}>{recipe.title}</Text>
        <Text style={styles.detailsText}>{recipe.description}</Text>
        <View style={styles.detailsMetaGrid}>
          <MetaItem label="Време за подготовка" value={`${recipe.prepTimeMinutes} мин`} />
          <MetaItem label="Време за готвене" value={`${recipe.cookTimeMinutes} мин`} />
          <MetaItem label="Порции" value={`${recipe.servings}`} />
          <MetaItem label="Трудност" value={recipe.difficulty} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Продукти</Text>
        {recipe.ingredients.map((ingredient) => (
          <View key={ingredient} style={styles.listRow}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>{ingredient}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Начин на приготвяне</Text>
        {recipe.steps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function FavoritesView({ onBrowse }: { onBrowse: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Любими рецепти</Text>
        <Text style={styles.heroTitle}>Запази идеи за по-късно</Text>
        <Text style={styles.heroText}>
          Тук ще се пазят рецептите, които искаш да приготвиш по-късно.
        </Text>
      </View>

      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>Функцията идва скоро</Text>
        <Text style={styles.emptyText}>
          Любимите рецепти ще бъдат свързани с потребителски профили и REST API синхронизация на
          следващ етап.
        </Text>
        <Pressable onPress={onBrowse} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Разгледай рецепти</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function LoginView({ onRegister }: { onRegister: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Потребителски достъп</Text>
        <Text style={styles.heroTitle}>Вход в профила</Text>
        <Text style={styles.heroText}>
          Реалната автентикация ще бъде свързана по-късно чрез REST API и JWT токени.
        </Text>
      </View>

      <View style={styles.panel}>
        <Field label="Имейл" placeholder="ime@example.com" keyboardType="email-address" />
        <Field label="Парола" placeholder="Въведи парола" secureTextEntry />
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Вход</Text>
        </Pressable>
        <Pressable onPress={onRegister} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Създай регистрация</Text>
        </Pressable>
      </View>

      <Notice text="Формата е неактивна и не изпраща реална заявка." />
    </ScrollView>
  );
}

function RegisterView({ onLogin }: { onLogin: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Нов профил</Text>
        <Text style={styles.heroTitle}>Създай регистрация</Text>
        <Text style={styles.heroText}>
          Създаването на акаунт ще бъде свързано с backend endpoint на следващ етап.
        </Text>
      </View>

      <View style={styles.panel}>
        <Field label="Име" placeholder="Твоето име" />
        <Field label="Имейл" placeholder="ime@example.com" keyboardType="email-address" />
        <Field label="Парола" placeholder="Създай парола" secureTextEntry />
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Регистрация</Text>
        </Pressable>
        <Pressable onPress={onLogin} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Вече имаш профил</Text>
        </Pressable>
      </View>

      <Notice text="По-късно паролата ще се обработва сигурно от backend-а и няма да се пази локално." />
    </ScrollView>
  );
}

function ProfileView({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Профил</Text>
        <Text style={styles.heroTitle}>Моят dashboard</Text>
        <Text style={styles.heroText}>
          Това е примерен профил без реална сесия. Данните ще се зареждат след свързване с API.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatBox label="Любими" value="0" />
        <StatBox label="Статус" value="Примерен" />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Обобщение</Text>
        <Text style={styles.cardText}>
          Тук ще се показват запазени рецепти, данни за акаунта и настройки на потребителя.
        </Text>
        <View style={styles.buttonRow}>
          <Pressable onPress={onLogin} style={styles.primaryButtonCompact}>
            <Text style={styles.primaryButtonText}>Вход</Text>
          </Pressable>
          <Pressable onPress={onRegister} style={styles.secondaryButtonCompact}>
            <Text style={styles.secondaryButtonText}>Регистрация</Text>
          </Pressable>
        </View>
      </View>

      <Notice text="Профилът ще използва реални потребителски данни, JWT сесия и REST API заявки по-късно." />
    </ScrollView>
  );
}

function Field({
  label,
  placeholder,
  keyboardType,
  secureTextEntry
}: {
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.softText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function TabButton({
  isActive,
  label,
  onPress
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const colors = {
  background: "#fffaf3",
  brand: "#f36b0f",
  brandDark: "#9f3f12",
  brandSoft: "#fff1df",
  border: "#eadfce",
  card: "#ffffff",
  text: "#1c140d",
  muted: "#6b5b4d",
  softText: "#8b7867"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12
  },
  brand: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 118
  },
  heroPanel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 8,
    padding: 20
  },
  kicker: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginTop: 10
  },
  heroText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10
  },
  filterPanel: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: "#ffd9ad",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    padding: 14
  },
  filterText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "800"
  },
  filterAction: {
    color: colors.brandDark,
    fontSize: 13,
    fontWeight: "800"
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    marginTop: 24
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800"
  },
  sectionMeta: {
    color: colors.softText,
    fontSize: 13,
    fontWeight: "700"
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    padding: 18
  },
  cardSelected: {
    borderColor: colors.brand,
    borderWidth: 2
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  difficulty: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: "800"
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 14
  },
  cardTitleSmall: {
    color: colors.text,
    flex: 1,
    fontSize: 21,
    fontWeight: "800"
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8
  },
  metaGrid: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 14
  },
  detailsMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  metaItem: {
    flex: 1,
    minWidth: 90
  },
  metaLabel: {
    color: colors.softText,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15
  },
  metaValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  backButtonText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "800"
  },
  detailsHero: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 16,
    padding: 20
  },
  detailsTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    marginTop: 14
  },
  detailsText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10
  },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    padding: 18
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
    marginTop: 7,
    width: 7
  },
  listText: {
    color: colors.muted,
    flex: 1,
    fontSize: 15,
    lineHeight: 22
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
    width: 30
  },
  stepBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  emptyPanel: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 28,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: 18,
    padding: 24
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 999,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  primaryButtonCompact: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 999,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  secondaryButtonCompact: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "800"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  field: {
    marginBottom: 14
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  notice: {
    backgroundColor: colors.brandSoft,
    borderColor: "#ffd9ad",
    borderRadius: 22,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: 16,
    padding: 16
  },
  noticeText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16
  },
  statBox: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    padding: 16
  },
  statValue: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 6
  },
  tabBar: {
    backgroundColor: "rgba(255, 250, 243, 0.96)",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 8,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 14,
    position: "absolute",
    right: 0
  },
  tabButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 10
  },
  tabButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  tabButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  tabButtonTextActive: {
    color: "#ffffff"
  }
});
