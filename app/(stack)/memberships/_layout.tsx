import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="book" options={{ headerShown: false }} />
    </Stack>
  );
}
