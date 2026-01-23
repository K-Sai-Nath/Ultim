import { Stack } from "expo-router";
export default function MobileOTPLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="mobile"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen name="otp" options={{ headerShown: false }}></Stack.Screen>
    </Stack>
  );
}
