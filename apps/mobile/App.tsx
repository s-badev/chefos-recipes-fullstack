import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Chefo’s Recipes</Text>
      <Text style={styles.title}>Mobile shell is ready</Text>
      <Text style={styles.body}>
        This is the initial Expo + TypeScript setup. API integration and navigation will be added
        later.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  kicker: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#8B5B2A",
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F140A",
    marginBottom: 12
  },
  body: {
    fontSize: 14,
    color: "#4B3420",
    textAlign: "center",
    lineHeight: 20
  }
});
