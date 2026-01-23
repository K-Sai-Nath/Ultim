import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  const iconColor = isDark ? "#E5E7EB" : "#6B7280";

  const handleReset = () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    // TEMP: redirect directly to login
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-4 pt-10">
          <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
            {/* Title */}
            <Text className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
              Reset Password
            </Text>

            <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Enter your new password
            </Text>

            {/* New Password */}
            <View className="mt-6 flex-row items-center h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
              <TextInput
                placeholder="New password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setError(null);
                }}
                placeholderTextColor={placeholderColor}
                className="flex-1 text-text-primary-light dark:text-text-primary-dark"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View className="mt-4 flex-row items-center h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
              <TextInput
                placeholder="Confirm password"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={(v) => {
                  setConfirm(v);
                  setError(null);
                }}
                placeholderTextColor={placeholderColor}
                className="flex-1 text-text-primary-light dark:text-text-primary-dark"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialIcons
                  name={showConfirm ? "visibility" : "visibility-off"}
                  size={20}
                  color={iconColor}
                />
              </TouchableOpacity>
            </View>

            {error && (
              <Text className="mt-2 text-sm text-red-500">{error}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              className="mt-6 h-12 rounded-lg bg-primary items-center justify-center"
              onPress={handleReset}
            >
              <Text className="text-white font-bold">Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
