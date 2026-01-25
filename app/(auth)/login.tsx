import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#E5E7EB" : "#6B7280";
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    router.push("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Top Section */}
          <View className="items-center mt-10 mb-8">
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt2CVXGBaJinw1uoqASnjkZD32KV1P6fScn7J71oiRCHazp75-_RPJV2-7APVmXE807GSM0_-YYXLYaGWXkkxhm2jIHXy2WZOMnWZOeVWdtj_jlIc5ln1wJxj23s9bCYyNCCY6SDsXgCqK1_9zRECD6dsEhLZktjLHyxAzgrHR0SibgM-T7DuRXTa7OCYyoRUSlkwCCUpZjn3TWPG_qtGzHUw1IUe5SFi-kpYaGRtu3aOpxfjetb7syytnUWlbOPM1IY4ZTqPDNfC4",
              }}
              className="h-24 w-24"
              resizeMode="contain"
            />

            <Text className="mt-6 text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Welcome Back
            </Text>
            <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Login to continue
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            <Input
              label="Email Address"
              icon="email"
              iconColor={iconColor}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              value={form.email}
              error={errors.email}
              onChangeText={(v: string) => updateField("email", v)}
            />

            <Input
              label="Password"
              icon="lock"
              iconColor={iconColor}
              placeholder="Enter password"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              value={form.password}
              error={errors.password}
              onChangeText={(v: string) => updateField("password", v)}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              className="items-end"
              onPress={() => router.push("/(auth)/(forgot-password)/email")}
            >
              <Text className="text-sm text-primary font-medium">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          {/* Actions */}
          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="h-12 bg-primary rounded-lg items-center justify-center"
              onPress={handleLogin}
            >
              <Text className="text-white font-bold text-base">Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/(mobile-otp)/mobile")}
              className="h-12 border border-primary rounded-lg items-center justify-center"
            >
              <Text className="text-primary font-semibold">Login with OTP</Text>
            </TouchableOpacity>
          </View>
          <Text className="mt-4 text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
            By continuing, you agree to our{" "}
            <Text
              className="text-primary font-medium"
              onPress={() => router.push("/(stack)/termsConditions")}
            >
              Terms & Conditions
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* INPUT COMPONENT                     */
/* ---------------------------------- */

function Input({ label, icon, iconColor, error, rightIcon, ...props }: any) {
  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
        {label}
      </Text>

      <View className="flex-row items-center h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
        <MaterialIcons name={icon} size={20} color={iconColor} />
        <TextInput
          className="flex-1 ml-2 text-sm text-text-primary-light dark:text-text-primary-dark"
          {...props}
        />
        {rightIcon}
      </View>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
