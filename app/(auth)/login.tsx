import { useAuth } from "@/context/AuthContext";
import { checkAuth } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

  const { setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    toast: "",
  });

  const iconColor = isDark ? "#E5E7EB" : "#6B7280";
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
      toast: "",
    }));
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    const newErrors = {
      email: "",
      password: "",
      toast: "",
    };

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        "https://ultim-server.vercel.app/api/users/login",
        {
          email: form.email.trim(),
          password: form.password,
        },
      );

      await SecureStore.setItemAsync("access_token", res.data.token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });

      const data = await checkAuth();
      const backendUser = data.user;

      setUser({
        id: String(backendUser.id),
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: backendUser.role,
      });

      router.replace("/(tabs)/home");
    } catch (err) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          message;
      }

      setErrors({
        email: "",
        password: "",
        toast: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Header */}
          <View className="items-center mt-10 mb-8">
            <Image
              source={require("../../assets/images/Login.png")}
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
          <View className="gap-3">
            <Input
              label="Email Address"
              icon="email"
              iconColor={iconColor}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={form.email}
              error={errors.email}
              onChangeText={(value: string) => updateField("email", value)}
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
              onChangeText={(value: string) => updateField("password", value)}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              }
            />

            {errors.toast ? (
              <Text className="ml-1 mt-1 text-sm text-red-500">
                {errors.toast}
              </Text>
            ) : null}

            <TouchableOpacity
              className="items-end"
              onPress={() => router.push("/(auth)/(forgot-password)/email")}
            >
              <Text className="text-sm font-medium text-primary">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="h-12 items-center justify-center rounded-lg bg-primary"
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-base font-bold text-white">Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/(mobile-otp)/mobile")}
              className="h-12 items-center justify-center rounded-lg border border-primary"
              activeOpacity={0.8}
            >
              <Text className="font-semibold text-primary">Login with OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text className="mt-4 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
            By continuing, you agree to our{" "}
            <Text
              className="font-medium text-primary"
              onPress={() => router.push("/(stack)/termsConditions")}
            >
              Terms & Conditions
            </Text>
          </Text>

          {/* Create Account */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Don&apos;t have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-primary">Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({ label, icon, iconColor, error, rightIcon, ...props }: any) {
  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
        {label}
      </Text>

      <View
        className={`flex-row items-center h-12 rounded-lg border px-3 bg-background-light dark:bg-background-dark ${
          error
            ? "border-red-500"
            : "border-border-light dark:border-border-dark"
        }`}
      >
        <MaterialIcons name={icon} size={20} color={iconColor} />

        <TextInput
          className="ml-2 flex-1 text-sm text-text-primary-light dark:text-text-primary-dark"
          {...props}
        />

        {rightIcon}
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
