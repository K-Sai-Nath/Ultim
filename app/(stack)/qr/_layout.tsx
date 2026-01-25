import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[bookingId]" options={{ headerShown: false }} />
    </Stack>
  );
}
