import { Stack } from "expo-router";
export default function ForgotPasswordLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="email"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="resetPassword"
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack>
  );
}
