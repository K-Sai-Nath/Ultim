import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
/* ---------------------------------- */

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function BookingAccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  console.log(bookingId);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [qrToken, setQrToken] = useState<string | null>(null);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const generateQR = async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("No token");

        const qrRes = await axios.post(
          `https://ultim-server.vercel.app/api/bookings/${Number(
            bookingId
          )}/generate-qr`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(qrRes.data.token);
        setQrToken(qrRes.data.token);
      } catch (err) {
        console.log("QR refresh error:", err);
      }
      timeout = setTimeout(generateQR, 15000);
    };

    if (bookingId) {
      generateQR();
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [bookingId]);
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = await getAccessToken();
        const res = await axios.get(
          `https://ultim-server.vercel.app/api/bookings/${Number(
            bookingId
          )}?depth=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBooking(res.data);
      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);
  if (isLoading || !qrToken || !booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#ff7b00" />
        <Text className="mt-5 text-text-primary-light dark:text-text-primary-dark text-base font-medium">
          Loading access...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <Text className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold">
          Something went wrong
        </Text>
      </SafeAreaView>
    );
  }
  const iconColor = isDark ? "#f5f5f5" : "#000000";

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* Header (same as other pages) */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Access Pass
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View className="items-center mt-6 mb-8">
          <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
              Active Booking
            </Text>
          </View>
        </View>

        {/* QR Card */}
        <View className="items-center">
          <View
            className="rounded-2xl bg-card-light dark:bg-card-dark p-5 border border-border-light dark:border-border-dark"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View className="items-center justify-center w-[220px] h-[220px]">
              {qrToken && (
                <QRCode
                  value={qrToken}
                  size={280}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  ecl="H"
                  quietZone={3}
                />
              )}
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="items-center mt-8 px-4">
          <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {booking.membership.membershipPlanName}
          </Text>
          <Text className="mt-1 text-base text-text-secondary-light dark:text-text-secondary-dark">
            {(() => {
              const date = new Date(booking.sessionDate);

              const formattedDate = date.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const startHour = parseInt(booking.sessionTime.split(":")[0]);
              const startTime = new Date(date);
              startTime.setHours(startHour, 0, 0);

              const endTime = new Date(startTime);
              endTime.setHours(startHour + booking.duration);

              const formatTime = (d: Date) =>
                d.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

              return `Valid on ${formattedDate} • ${formatTime(startTime)} – ${formatTime(endTime)}`;
            })()}
          </Text>
        </View>

        {/* Instructions */}
        <View className="mt-8 gap-4">
          <View className="flex-row gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <MaterialIcons name="qr-code-scanner" size={22} color="#ff7b00" />
            <View className="flex-1">
              <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                Scan at the reader
              </Text>
              <Text className="text-xs mt-1 text-text-secondary-light dark:text-text-secondary-dark">
                Hold your phone 4–6 inches from the scanner to enter or exit.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-2">
            <MaterialIcons
              name="shield"
              size={14}
              color={isDark ? "#a1a1aa" : "#6b7280"}
            />
            <Text className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
              Encrypted Secure Access
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
