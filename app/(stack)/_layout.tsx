import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="editProfile" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="termsConditions" options={{ headerShown: false }} />
      <Stack.Screen name="helpCenter" options={{ headerShown: false }} />
      <Stack.Screen name="contactSupport" options={{ headerShown: false }} />
      <Stack.Screen name="paymentMethods" options={{ headerShown: false }} />
      <Stack.Screen name="qr" options={{ headerShown: false }} />
      <Stack.Screen name="activites" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
    </Stack>
  );
}
