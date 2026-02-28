import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[membershipId]" options={{ headerShown: false }} />
    </Stack>
  );
}
