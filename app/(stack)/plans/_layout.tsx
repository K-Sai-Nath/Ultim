import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[category]" options={{ headerShown: false }} />
    </Stack>
  );
}
