import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ScrollViewProps,
  type ViewStyle
} from "react-native";
import { colors } from "../theme";

type ScreenShellProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
  scroll?: boolean;
} & Pick<ScrollViewProps, "refreshControl">;

export function ScreenShell({
  children,
  contentStyle,
  refreshControl,
  scroll = true
}: ScreenShellProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const horizontalPadding = isWide ? 24 : 18;

  const containerStyle: ViewStyle = {
    alignSelf: "center",
    maxWidth: 840,
    paddingHorizontal: horizontalPadding,
    width: "100%"
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, containerStyle, contentStyle]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, containerStyle, styles.flexContent, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    paddingBottom: 28,
    paddingTop: 16
  },
  flexContent: {
    flex: 1
  }
});
