import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, useColorScheme } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 24,
        flexDirection: "row",
        height: 64,
        borderRadius: 24,

        backgroundColor: isDark ? "#1a1a1a" : "#ffffff",

        shadowColor: "#000",
        shadowOpacity: isDark ? 0.35 : 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const onPress = () => navigation.navigate(route.name);

        const icon =
          typeof options.tabBarIcon === "function"
            ? options.tabBarIcon({
                focused,
                size: 22,
                color: focused ? "#ff7b00" : isDark ? "#a1a1aa" : "#6b7280",
              })
            : null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.85}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 24,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? isDark
                    ? "#2a2a2a"
                    : "#fff7ed"
                  : "transparent",
              }}
            >
              {icon}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
