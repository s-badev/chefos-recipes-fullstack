import { StyleSheet, Text, View } from "react-native";
import { colors, shadows } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

type EmptyStateProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ actionLabel, onAction, text, title }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...shadows.card,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 24
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 29,
    textAlign: "center"
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: 10,
    textAlign: "center"
  },
  button: {
    marginTop: 18
  }
});
