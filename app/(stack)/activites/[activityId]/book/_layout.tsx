import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[venueId]" options={{ headerShown: false }} />
    </Stack>
  );
}
