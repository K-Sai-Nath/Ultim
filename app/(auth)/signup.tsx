import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function SignupScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#E5E7EB" : "#6B7280";
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    toast: "",
  });

  const updateField = (
    key: keyof typeof form,
    value: string
  ) => {
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
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      toast: "",
    };

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword =
        "Confirm password is required";
    } else if (
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return (
      !newErrors.fullName &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword
    );
  };

  const handleSignup = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "https://ultim-server.vercel.app/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      setSuccessMessage("Account created successfully!");
      
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        toast: error instanceof Error ? error.message : "Something went wrong",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 80 : 0
        }
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
              Create Account
            </Text>

            <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Sign up to get started
            </Text>
          </View>

          {/* Form */}
          <View className="gap-3">
            <Input
              label="Full Name"
              icon="person"
              iconColor={iconColor}
              placeholder="Enter your full name"
              placeholderTextColor={placeholderColor}
              value={form.fullName}
              error={errors.fullName}
              onChangeText={(v: string) =>
                updateField("fullName", v)
              }
            />

            <Input
              label="Email Address"
              icon="email"
              iconColor={iconColor}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              value={form.email}
              error={errors.email}
              onChangeText={(v: string) =>
                updateField("email", v)
              }
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
              onChangeText={(v: string) =>
                updateField("password", v)
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  <MaterialIcons
                    name={
                      showPassword
                        ? "visibility"
                        : "visibility-off"
                    }
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              icon="lock"
              iconColor={iconColor}
              placeholder="Confirm password"
              placeholderTextColor={placeholderColor}
              secureTextEntry={
                !showConfirmPassword
              }
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChangeText={(v: string) =>
                updateField(
                  "confirmPassword",
                  v
                )
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  <MaterialIcons
                    name={
                      showConfirmPassword
                        ? "visibility"
                        : "visibility-off"
                    }
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              }
            />

            {errors.toast ? (
              <Text className="text-red-500 text-sm">
                {errors.toast}
              </Text>
            ) : null}

            {successMessage ? (
              <Text className="text-green-500 text-sm font-semibold">
                ✓ {successMessage}
              </Text>
            ) : null}
          </View>

          {/* Buttons */}
          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="h-12 bg-primary rounded-lg items-center justify-center"
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text className="text-white font-bold text-base">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/(auth)/(mobile-otp)/mobile"
                )
              }
              className="h-12 border border-primary rounded-lg items-center justify-center"
            >
              <Text className="text-primary font-semibold">
                Sign Up with OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
              Already have an account?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-primary font-semibold">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({
  label,
  icon,
  iconColor,
  error,
  rightIcon,
  ...props
}: any) {
  return (
    <View>
      <Text className="mb-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
        {label}
      </Text>

      <View className="flex-row items-center h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
        <MaterialIcons
          name={icon}
          size={20}
          color={iconColor}
        />

        <TextInput
          className="flex-1 ml-2 text-sm text-text-primary-light dark:text-text-primary-dark"
          {...props}
        />

        {rightIcon}
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">
          {error}
        </Text>
      ) : null}
    </View>
  );
}