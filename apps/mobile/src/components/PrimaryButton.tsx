import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { colors, shadows } from "../theme";

type PrimaryButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary" | "danger";
};

export function PrimaryButton({
  disabled,
  label,
  loading = false,
  style,
  variant = "primary",
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.brandDark : "#ffffff"} />
      ) : (
        <Text style={[styles.label, variant === "secondary" ? styles.secondaryLabel : null]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  primary: {
    ...shadows.card,
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryLabel: {
    color: colors.brandDark
  },
  disabled: {
    opacity: 0.62
  },
  pressed: {
    transform: [{ translateY: 1 }]
  }
});
