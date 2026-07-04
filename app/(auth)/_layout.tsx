import { Stack } from "expo-router";
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="signup"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="(mobile-otp)"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="(forgot-password)"
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack>
  );
}
