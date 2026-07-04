import { useAuth } from "@/context/AuthContext";
import { checkAuth } from "@/services/authService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
const RESEND_TIME = 30;

export default function OtpVerificationScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
const {setUser}=useAuth()
  const { phone, callingCode } = useLocalSearchParams<{
    phone: string;
    callingCode: string;
  }>();

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
setOtp("");
    try {
      const response = await axios.post(
        "https://ultim-server.vercel.app/api/users/send-otp",
        {
          phone: `${callingCode}${phone}`,
        },
      );
      console.log("Resend OTP Response:", response.data);

      setOtp("");
      setSeconds(RESEND_TIME);
      setCanResend(false);

      Toast.show({
        type: "success",
        position: "top",
        text1: "OTP Resent",
        text2: "Check your SMS for the new code",
      });
    } catch (err: any) {
      let errorMessage = "Failed to resend OTP. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===== Verify OTP ===== */
  const handleVerify = async () => {
    if (otp.length !== 4) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://ultim-server.vercel.app/api/users/verify-otp",
        {
          phone: `${callingCode}${phone}`,
          otp: otp,
        },
      );
      if (response.status === 200 || response.status === 201) {
      
        Toast.show({
          type: "success",
          position: "top",
          text1: "✓ OTP Verified",
          text2: "You have been verified successfully",
        });
  await SecureStore.setItemAsync("access_token", response.data.token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    console.log("Access Token Saved:", response.data.token);
    const data = await checkAuth();
    console.log("Check Auth Response:", data);
    const backendUser = data.user;
      setUser({
        id: String(backendUser.id),
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: backendUser.role,
        tenants: backendUser.tenants.map((item: any) => ({
          id: item.tenant.id,
          Facility: item.tenant.Facility,
          FacilityImage: item.tenant.FacilityImage,
        })),
      });
          if(response.data.user.fullName==null || response.data.user.fullName==""){
            router.push("/(auth)/(mobile-otp)/name");
          }else{
            router.push("/(tabs)/home");
          }
        
      }
    } catch (err: any) {
      let errorMessage = "Verification failed. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        console.log("Verify OTP Error Response:", { status, data });

        if (status === 400) {
          errorMessage = data.message || "Invalid OTP";
        } else if (status === 401) {
          errorMessage = "OTP is incorrect. Please try again.";
        } else if (status === 404) {
          errorMessage = "Phone number not found. Please start over.";
        } else if (status === 410) {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (status === 429) {
          errorMessage = "Too many attempts. Please wait before trying again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
        console.log("Verify OTP Network Error:", err.request);
      } else {
        console.log("Verify OTP Error:", err.message);
      }

      setError(errorMessage);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Verification Failed",
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
      Verify OTP
    </Text>
  </View>

  {/* Card */}
  <View className="w-full max-w-md self-center rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
    <Text className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark">
      Enter the 4-digit verification code sent to
    </Text>

    <Text className="mt-1 text-center text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
      +{callingCode} {phone}
    </Text>

    {/* OTP */}
    <View className="mt-8">
      <OtpInput
        numberOfDigits={4}
        onTextChange={(text) => {
          setOtp(text);
          if (error) setError("");
        }}
        focusColor="#ff7b00"
        theme={{
          containerStyle: {
            justifyContent: "space-between",
          },
          pinCodeContainerStyle: {
            borderWidth: 1,
            borderColor: error ? "#ef4444" : borderColor,
            borderRadius: 12,
            width: 58,
            height: 58,
            backgroundColor: "transparent",
          },
          pinCodeTextStyle: {
            fontSize: 20,
            fontWeight: "700",
            color: isDark ? "#F5F5F5" : "#111827",
          },
        }}
      />
    </View>

    {/* Error */}
    {error ? (
      <View className="flex-row items-center mt-4">
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

    {/* Verify Button */}
    <TouchableOpacity
      onPress={handleVerify}
      disabled={otp.length !== 4 || loading}
      activeOpacity={0.85}
      className={`mt-8 h-12 rounded-lg flex-row items-center justify-center ${
        otp.length === 4 && !loading
          ? "bg-primary"
          : "bg-primary/40"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text className="text-white font-bold text-base">
            Verify OTP
          </Text>

          <MaterialIcons
            name="check"
            size={18}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </>
      )}
    </TouchableOpacity>

    {/* Resend */}
    <View className="mt-6 items-center">
      {canResend ? (
        <TouchableOpacity
          onPress={handleResend}
          disabled={loading}
          className="flex-row items-center"
        >
          <MaterialIcons
            name="refresh"
            size={18}
            color="#ff7b00"
          />

          <Text className="ml-2 font-semibold text-primary">
            Resend OTP
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Resend OTP in{" "}
          <Text className="font-semibold text-primary">
            {seconds}s
          </Text>
        </Text>
      )}
    </View>

    {/* Footer */}
    <Text className="mt-5 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
      Didn't receive the code? Check your SMS inbox or request a new OTP after the timer ends.
    </Text>
  </View>
</SafeAreaView>
      <Toast />
    </>
  );
}


