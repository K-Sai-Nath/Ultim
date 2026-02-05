import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK DATA (same style as others)   */
/* ---------------------------------- */

const BOOKINGS = [
  {
    id: "1",
    title: "Vinyasa Flow Yoga",
    validTill: "10:00 PM",
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function BookingAccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const booking = BOOKINGS.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Booking not found
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
            className="
      rounded-2xl
      bg-card-light dark:bg-card-dark
      p-5
      border border-border-light dark:border-border-dark
    "
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View
              className="
        relative
        w-[220px] aspect-square
        rounded-xl overflow-hidden
        bg-background-light dark:bg-background-dark
        border border-border-light dark:border-border-dark
      "
            >
              {/* Subtle glow */}
              <View className="absolute inset-0 bg-primary/5" />

              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=ULTIM-${bookingId}`,
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="items-center mt-8 px-4">
          <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {booking.title}
          </Text>
          <Text className="mt-1 text-base text-text-secondary-light dark:text-text-secondary-dark">
            Valid until {booking.validTill}
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
