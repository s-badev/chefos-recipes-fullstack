import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

type CategoryPillProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function CategoryPill({ label, onPress, selected = false }: CategoryPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null
      ]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  label: {
    color: colors.cocoa,
    fontSize: 14,
    fontWeight: "800"
  },
  selectedLabel: {
    color: "#ffffff"
  },
  pressed: {
    opacity: 0.82
  }
});
