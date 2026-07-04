import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";


export default function NameScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateName = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = async () => {
    const token=await getAccessToken()
  const id=user?.id
    if (!validateName()) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.patch(
        `https://ultim-server.vercel.app/api/users/${id}`,
        {
          "fullName": name,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update Name Response:", response.data);

      if (response.status === 200 || response.status === 201) {
        const updatedName = name.trim();

        setUser(
          user
            ? {
                ...user,
                fullName: updatedName,
              }
            : {
                id: id || "",
                fullName: updatedName,
                email: "",
                role: "",
              }
        );

        Toast.show({
          type: "success",
          position: "top",
          text1: "✓ Profile Updated",
          text2: "Your name has been saved successfully",
        });
        setTimeout(() => {
          router.push("/(tabs)/home");
        }, 1500);
      }
    } catch (err: any) {
      let errorMessage = "Failed to update name. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        console.log("Update Name Error Response:", { status, data });

        if (status === 400) {
          errorMessage = data.message || "Invalid name format";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to update this profile.";
        } else if (status === 404) {
          errorMessage = "User not found. Please try again.";
        } else if (status === 422) {
          errorMessage = data.message || "Invalid input. Please check your name.";
        } else if (status === 429) {
          errorMessage = "Too many requests. Please wait before trying again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
        console.log("Update Name Network Error:", err.request);
      } else {
        console.log("Update Name Error:", err.message);
      }

      setError(errorMessage);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Update Failed",
        text2: errorMessage,

      });
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#F5F5F5" : "#111827"}
          />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark mr-10">
          Complete Profile
        </Text>
      </View>

      {/* Card */}
      <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
        <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark">
          Almost done! Tell us your full name to personalize your experience.
        </Text>

        {/* Name Input */}
        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Full Name
          </Text>

          <View
            className={`flex-row items-center h-12 rounded-lg border px-3 ${
              error
                ? "border-red-500 bg-red-50 dark:bg-red-950"
                : "border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark"
            }`}
          >
            <MaterialIcons
              name="person-outline"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />

            <TextInput
              className="flex-1 ml-3 text-sm text-text-primary-light dark:text-text-primary-dark"
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={name}
              editable={!loading}
              maxLength={50}
              onChangeText={(text) => {
                setName(text);
                if (error) setError("");
              }}
            />

            {name.trim().length > 1 && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color="#22c55e"
              />
            )}
          </View>

          {error ? (
            <View className="flex-row items-center mt-2">
              <MaterialIcons
                name="error-outline"
                size={16}
                color="#ef4444"
              />
              <Text className="ml-2 flex-1 text-xs text-red-500">
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading || !name.trim()}
          activeOpacity={0.85}
          className={`mt-8 h-12 rounded-lg flex-row items-center justify-center ${
            loading || !name.trim()
              ? "bg-primary/40"
              : "bg-primary"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-base font-bold text-white">
                Continue
              </Text>

              <MaterialIcons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <Text className="mt-5 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          This name will be displayed on your profile and can be updated later.
        </Text>
      </View>
    </SafeAreaView>

    <Toast />
  </>
);
}
