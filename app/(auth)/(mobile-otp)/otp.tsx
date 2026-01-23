import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

const RESEND_TIME = 30;

export default function OtpVerificationScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // ✅ Params from EnterMobileScreen
  const { phone, callingCode } = useLocalSearchParams<{
    phone: string;
    callingCode: string;
  }>();

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const borderColor = isDark ? "#2a2a2a" : "#e5e7eb";
  /* ===== Start Timer ===== */
  useEffect(() => {
    if (seconds === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  /* ===== Resend OTP ===== */
  const handleResend = () => {
    if (!canResend) return;

    setOtp("");
    setSeconds(RESEND_TIME);
    setCanResend(false);
  };

  /* ===== Verify OTP ===== */
  const handleVerify = () => {
    console.log(otp);
    if (otp.length !== 6) return;

    // TODO: Call verify OTP API here
    // On success:
    // router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark px-4 pt-8">
      <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
        {/* Title */}
        <Text className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
          Verify OTP
        </Text>

        <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
          Enter the 6-digit code sent to{" "}
          <Text className="font-semibold">
            +{callingCode} {phone}
          </Text>
        </Text>

        {/* OTP Input */}
        <View className="mt-8">
          <OtpInput
            numberOfDigits={6}
            onTextChange={setOtp}
            focusColor="#ff7b00"
            theme={{
              containerStyle: {
                justifyContent: "space-between",
              },
              pinCodeContainerStyle: {
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                width: 48,
                height: 48,
              },
              pinCodeTextStyle: {
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#f5f5f5" : "#000000",
              },
            }}
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className={`mt-8 h-12 rounded-lg items-center justify-center ${
            otp.length === 6 ? "bg-primary" : "bg-primary/40"
          }`}
          disabled={otp.length !== 6}
          onPress={handleVerify}
        >
          <Text className="text-white font-bold text-base">Verify</Text>
        </TouchableOpacity>

        {/* Resend */}
        <View className="mt-6 items-center">
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-primary font-semibold">Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Resend OTP in {seconds}s
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
