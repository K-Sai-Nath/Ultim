import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EnterMobileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  const router = useRouter();

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  const validatePhone = () => {
    if (!phone.trim()) {
      setError("Please enter your mobile number");
      return false;
    }

    if (phone.trim().length < 10) {
      setError("Mobile number must be at least 10 digits");
      return false;
    }

    setError("");
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://ultim-server.vercel.app/api/users/send-otp",
        {
          phone: `${callingCode}${phone.trim()}`,
        }
      );

      if (response.status === 200 || response.status === 201) {
        router.push({
          pathname: "/(auth)/(mobile-otp)/otp",
          params: {
            phone,
            countryCode,
            callingCode,
          },
        });
      }
    } catch (err: any) {
      let errorMessage = "Something went wrong. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          errorMessage = data?.message || "Invalid mobile number.";
        } else if (status === 401) {
          errorMessage = "Unauthorized request.";
        } else if (status === 404) {
          errorMessage = "Service unavailable.";
        } else if (status === 409) {
          errorMessage =
            data?.message || "This mobile number is already registered.";
        } else if (status === 429) {
          errorMessage =
            "Too many requests. Please wait a few minutes before trying again.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage =
          "Unable to connect. Please check your internet connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Enter Mobile Number
        </Text>
      </View>

      {/* Card */}
      <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
        <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark">
          We’ll send you a one-time password (OTP) to verify your mobile number.
        </Text>

        {/* Phone Input */}
        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Mobile Number
          </Text>

          <View
            className={`flex-row items-center h-12 rounded-lg border px-3 ${
              error
                ? "border-red-500 bg-red-50 dark:bg-red-950"
                : "border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark"
            }`}
          >
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withFilter
              onSelect={onSelect}
              containerButtonStyle={{ marginRight: 6 }}
            />

            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mr-2">
              +{callingCode}
            </Text>

            <View className="h-6 w-px bg-border-light dark:bg-border-dark mx-2" />

            <TextInput
              className="flex-1 text-sm text-text-primary-light dark:text-text-primary-dark"
              placeholder="Enter phone number"
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^0-9]/g, ""));
                if (error) setError("");
              }}
              editable={!loading}
              maxLength={15}
            />
          </View>

          {error ? (
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text className="ml-1 flex-1 text-xs text-red-500">
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleSendOTP}
          disabled={loading || phone.trim().length < 10}
          activeOpacity={0.85}
          className={`mt-6 h-12 rounded-lg flex-row items-center justify-center ${
            loading || phone.trim().length < 10
              ? "bg-primary/40"
              : "bg-primary"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-base font-bold text-white">
                Send OTP
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
        <Text className="mt-4 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          By continuing, you agree to receive SMS updates.
        </Text>
      </View>
    </SafeAreaView>
  );
}