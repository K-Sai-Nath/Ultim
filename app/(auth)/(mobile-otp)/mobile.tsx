import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  const router = useRouter();
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-4 pt-8">
      <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
        {/* Title */}
        <Text className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
          Enter Mobile Number
        </Text>
        <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
          We’ll send you a one-time password (OTP)
        </Text>

        {/* Phone Input */}
        <View className="mt-6">
          <Text className="mb-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Mobile Number
          </Text>

          <View className="flex-row items-center h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
            {/* Country Picker (flag only) */}
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withFilter
              onSelect={onSelect}
              containerButtonStyle={{ marginRight: 6 }}
            />

            {/* Calling Code (single source of truth) */}
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mr-2">
              +{callingCode}
            </Text>

            {/* Divider */}
            <View className="h-6 w-px bg-border-light dark:bg-border-dark mx-2" />

            {/* Phone Input */}
            <TextInput
              className="flex-1 text-sm text-text-primary-light dark:text-text-primary-dark"
              placeholder="Enter phone number"
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`mt-6 h-12 rounded-lg items-center justify-center ${
            phone.length >= 10 ? "bg-primary" : "bg-primary/40"
          }`}
          disabled={phone.length < 8}
          onPress={() =>
            router.push({
              pathname: "/(auth)/(mobile-otp)/otp",
              params: {
                phone,
                countryCode,
                callingCode,
              },
            })
          }
        >
          <Text className="text-white font-bold text-base">Send OTP</Text>
        </TouchableOpacity>

        {/* Info */}
        <Text className="mt-4 text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
          By continuing, you agree to receive SMS updates.
        </Text>
      </View>
    </SafeAreaView>
  );
}
