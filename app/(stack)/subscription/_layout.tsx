import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[subscriptionId]" options={{ headerShown: false }} />
    </Stack>
  );
}
