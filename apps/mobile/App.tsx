import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import type { MainTabParamList, RootStackParamList } from "./src/navigation";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RecipeDetailsScreen } from "./src/screens/RecipeDetailsScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { colors } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: focused ? colors.brand : colors.surfaceWarm,
        borderColor: focused ? colors.brand : colors.border,
        borderRadius: 999,
        borderWidth: 1,
        height: 32,
        justifyContent: "center",
        width: 32
      }}
    >
      <Text
        style={{
          color: focused ? "#ffffff" : colors.brandDark,
          fontSize: 12,
          fontWeight: "900"
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800"
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          minHeight: 72,
          paddingBottom: 10,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Н" />,
          title: "Начало"
        }}
      />
      <Tabs.Screen
        component={CatalogScreen}
        name="Catalog"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="К" />,
          title: "Каталог"
        }}
      />
      <Tabs.Screen
        component={FavoritesScreen}
        name="Favorites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Л" />,
          title: "Любими"
        }}
      />
      <Tabs.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="П" />,
          title: "Профил"
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerShown: false
            }}
          >
            <Stack.Screen component={MainTabs} name="MainTabs" />
            <Stack.Screen component={RecipeDetailsScreen} name="RecipeDetails" />
            <Stack.Screen component={LoginScreen} name="Login" />
            <Stack.Screen component={RegisterScreen} name="Register" />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
