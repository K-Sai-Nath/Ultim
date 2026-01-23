import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK JSON (backend-style)           */
/* ---------------------------------- */

const BOOKINGS = [
  {
    id: "1",
    title: "HIIT Cycling",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCu2V_kuo4SHsfVPtXFi9_Hp0NGzzskiJV5sXw4XGKicWlEb9_xovH6b6Yt9_v1rXhbnBg2co04Ss8fqA_7ygMn9Zong12SSfTZzwyzeIKfMSRKAWcKQTCwiEyU16az53_UekwqseuhgiSp3Jz4oXBKBXY9e_JX3k8tE1d3qquRHBe8UCU1Wg76NVSCKU9AgyBRJB1Qh4oae6JY_EUJdQOhtRbGpy2Nq2ev9iDS7yoyays3CF9owCFJsvfx4ETF2tV_A17h-iWUYmmL",
    date: "Tue, 28 Nov 2024",
    time: "7:00 PM - 8:00 PM",
    venue: "ULTIM Fitness Downtown",
    address: "123 Fitness Ave, Cityville",
    credits: "15 Credits",
    status: "Confirmed",
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function BookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const iconColor = isDark ? "#f5f5f5" : "#000000";
  const booking = BOOKINGS.find((b) => b.id === bookingId);

  /* ---------------------------------- */
  /* LOADING STATE                      */
  /* ---------------------------------- */

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? "#0f0f0f" : "#f8f7f5" }}
      >
        <ActivityIndicator size="large" color="#ff7b00" />
      </SafeAreaView>
    );
  }

  /* ---------------------------------- */
  /* EMPTY STATE                        */
  /* ---------------------------------- */

  if (!booking) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: isDark ? "#0f0f0f" : "#f8f7f5" }}
      >
        <MaterialIcons
          name="event-busy"
          size={72}
          color={isDark ? "#6b7280" : "#9ca3af"}
          style={{ marginBottom: 16 }}
        />

        <Text
          className="text-lg font-semibold text-center"
          style={{ color: isDark ? "#f5f5f5" : "#111827" }}
        >
          Booking not found
        </Text>

        <Text
          className="mt-1 text-sm text-center"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          This booking may have been cancelled or removed
        </Text>
      </SafeAreaView>
    );
  }

  /* ---------------------------------- */
  /* MAIN UI                            */
  /* ---------------------------------- */

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#f8f7f5",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Booking Details
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <ImageBackground
          source={{ uri: booking.image }}
          className="h-64 rounded-xl overflow-hidden mb-6"
        >
          <Text className="absolute bottom-4 left-4 text-[28px] font-extrabold text-white">
            {booking.title}
          </Text>
        </ImageBackground>

        {/* Details Card */}
        <View className="rounded-xl bg-card-light dark:bg-card-dark p-5 mb-6 border border-border-light dark:border-border-dark">
          <DetailRow
            icon="calendar-today"
            title={booking.date}
            subtitle={booking.time}
          />

          <View className="h-px bg-border-light dark:bg-border-dark my-4" />

          <DetailRow
            icon="location-on"
            title={booking.venue}
            subtitle={booking.address}
          />
        </View>

        {/* Info */}
        <View className="rounded-xl bg-card-light dark:bg-card-dark p-5 mb-6 border border-border-light dark:border-border-dark">
          <InfoRow label="Booking ID" value={`ULTIM-${booking.id}`} />
          <InfoRow label="Credits Used" value={booking.credits} />
          <InfoRow label="Status" value={booking.status} />
        </View>
        {/* Actions */}
        <View className="mt-2 gap-4">
          <PrimaryButton
            icon="event"
            label="Add to Calendar"
            onPress={() => {}}
          />
          <SecondaryButton
            icon="directions"
            label="Get Directions"
            onPress={() => {}}
          />
        </View>

        {/* Policy */}
        <View className="mt-4 items-center">
          <Text className="text-sm underline text-text-secondary-light dark:text-text-secondary-dark">
            Cancellation Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function DetailRow({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-row gap-4">
      <View className="w-12 h-12 rounded-lg bg-primary/10 items-center justify-center">
        <MaterialIcons name={icon} size={24} color="#ff7b00" />
      </View>

      <View>
        <Text className="font-bold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2.5">
      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
        {value}
      </Text>
    </View>
  );
}

function PrimaryButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center gap-2 rounded-lg bg-primary py-3.5"
    >
      <MaterialIcons name={icon} size={20} color="#fff" />
      <Text className="text-base font-bold text-white">{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center gap-2 rounded-lg bg-primary/10 py-3.5"
    >
      <MaterialIcons name={icon} size={20} color="#ff7b00" />
      <Text className="text-base font-bold text-primary">{label}</Text>
    </TouchableOpacity>
  );
}
