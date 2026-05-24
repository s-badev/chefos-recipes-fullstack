import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { useState } from "react";
import { colors, shadows } from "../theme";
import type { RecipeSummary } from "../types";

type RecipeCardProps = {
  recipe: RecipeSummary;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function RecipeCard({ onPress, recipe, style }: RecipeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(recipe.imageUrl && !imageFailed);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null, style]}
    >
      <View style={styles.imageWrap}>
        {hasImage ? (
          <Image
            accessibilityLabel={recipe.imageAlt ?? recipe.title}
            onError={() => setImageFailed(true)}
            source={{ uri: recipe.imageUrl as string }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>{recipe.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.category}>
            {recipe.category}
          </Text>
          <Text style={styles.difficulty}>{recipe.difficulty}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {recipe.title}
        </Text>
        <Text numberOfLines={3} style={styles.description}>
          {recipe.description}
        </Text>
        <View style={styles.metaRow}>
          <Meta label="Подг." value={`${recipe.prepTimeMinutes} мин`} />
          <Meta label="Готв." value={`${recipe.cookTimeMinutes} мин`} />
          <Meta label="Порции" value={String(recipe.servings)} />
        </View>
      </View>
    </Pressable>
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
  card: {
    ...shadows.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden"
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }]
  },
  imageWrap: {
    backgroundColor: colors.brandSoft,
    height: 148,
    overflow: "hidden"
  },
  image: {
    height: "100%",
    resizeMode: "cover",
    width: "100%"
  },
  imageFallback: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    flex: 1,
    justifyContent: "center",
    padding: 18
  },
  imageFallbackText: {
    color: colors.brandDark,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  body: {
    padding: 16
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  category: {
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    color: colors.brandDark,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  difficulty: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 12
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 8
  },
  metaRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 12
  },
  metaItem: {
    flex: 1
  },
  metaLabel: {
    color: colors.softText,
    fontSize: 11,
    fontWeight: "800"
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3
  }
});
