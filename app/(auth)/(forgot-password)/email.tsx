import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordEmailScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const iconColor = isDark ? "#E5E7EB" : "#6B7280";
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (loading) return;

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      // 🔥 API call goes here
      await new Promise((res) => setTimeout(res, 1500));

      router.push({
        pathname: "/(auth)/(forgot-password)/resetPassword",
        params: { email },
      });
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-4"
      >
        <View className="w-full max-w-md self-center mt-10 rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
          {/* Title */}
          <Text className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
            Forgot Password
          </Text>

          <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
            Enter your email address to receive a reset code
          </Text>

          {/* Email Input */}
          <View className="mt-6">
            <Text className="mb-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Email Address
            </Text>

            <View
              className={`flex-row items-center h-12 rounded-lg px-3 border ${
                error
                  ? "border-red-500"
                  : "border-border-light dark:border-border-dark"
              } bg-background-light dark:bg-background-dark`}
            >
              <MaterialIcons name="email" size={20} color={iconColor} />
              <TextInput
                className="flex-1 ml-2 text-sm text-text-primary-light dark:text-text-primary-dark"
                placeholder="Enter your email"
                placeholderTextColor={placeholderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(undefined);
                }}
              />
            </View>

            {error && (
              <Text className="mt-1 text-xs text-red-500">{error}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mt-6 h-12 rounded-lg items-center justify-center bg-primary`}
            disabled={loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">
                Send Reset Code
              </Text>
            )}
          </TouchableOpacity>

          {/* Back */}
          <TouchableOpacity
            className="mt-4 items-center"
            disabled={loading}
            onPress={() => router.back()}
          >
            <Text className="text-sm text-primary font-medium">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
