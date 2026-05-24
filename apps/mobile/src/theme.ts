import { StyleSheet } from "react-native";

export const colors = {
  background: "#fffaf3",
  surface: "#ffffff",
  surfaceWarm: "#fff8ee",
  brand: "#ea580c",
  brandDark: "#9a3412",
  brandSoft: "#ffedd5",
  border: "#eadfce",
  text: "#22160d",
  cocoa: "#5a4030",
  muted: "#756454",
  softText: "#9a8471",
  danger: "#b91c1c",
  dangerSoft: "#fff1f1",
  success: "#3f6212",
  successSoft: "#f2f8dc"
};

export const shadows = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: "#503014",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20
  },
  lift: {
    elevation: 4,
    shadowColor: "#503014",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 26
  }
});
