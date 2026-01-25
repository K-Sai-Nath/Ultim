import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="[activityId]" options={{ headerShown: false }} />
    </Stack>
  );
}
