import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  /* ---------------------------------- */
  /* FETCH BOOKINGS (CACHED)            */
  /* ---------------------------------- */

  const fetchBookings = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.docs || [];
  };

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  /* ---------------------------------- */
  /* SPLIT UPCOMING / PAST              */
  /* ---------------------------------- */

  const now = new Date();

  const upcoming = useMemo(() => {
    return bookings.filter((b: any) => {
      const datePart = new Date(b.sessionDate);

      const [hour, minute] = b.sessionTime.split(":");

      datePart.setHours(parseInt(hour));
      datePart.setMinutes(parseInt(minute));

      return datePart >= now;
    });
  }, [bookings]);

  const past = useMemo(() => {
    return bookings.filter((b: any) => {
      const datePart = new Date(b.sessionDate);

      const [hour, minute] = b.sessionTime.split(":");

      datePart.setHours(parseInt(hour));
      datePart.setMinutes(parseInt(minute));

      return datePart < now;
    });
  }, [bookings]);
  console.log("Upcoming:", upcoming);
  const data = activeTab === "upcoming" ? upcoming : past;

  const iconColor = isDark ? "#f5f5f5" : "#000";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          My Bookings
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border-light dark:border-border-dark">
        {["upcoming", "past"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            className={`flex-1 items-center py-3 border-b-2 ${
              activeTab === tab ? "border-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`font-bold ${
                activeTab === tab
                  ? "text-text-primary-light dark:text-text-primary-dark"
                  : "text-text-secondary-light dark:text-text-secondary-dark"
              }`}
            >
              {tab === "upcoming" ? "Upcoming" : "Past"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4 mb-20">
        {isLoading && (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#ff7b00" />
          </View>
        )}

        {isError && (
          <View className="py-20 items-center">
            <Text className="text-red-500">Failed to load bookings</Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary rounded-xl"
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && data.length === 0 && (
          <View className="py-20 items-center">
            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
              No bookings found
            </Text>
          </View>
        )}

        {!isLoading &&
          !isError &&
          data.map((item: any) => {
            const dateObj = new Date(item.sessionDate);
            const dateString = dateObj.toDateString();

            return (
              <BookingCard
                key={item.id}
                data={{
                  title: item.membership?.membershipPlan?.planName || "Session",
                  subtitle: item.tenant?.Facility,
                  date: `${dateString} - ${item.sessionTime}`,
                  location: item.tenant?.Facility,
                  image:
                    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
                }}
                primaryAction={activeTab === "upcoming" ? "View QR" : null}
                onPrimaryPress={() => router.push(`/(stack)/qr/${item.id}`)}
              />
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* EMPTY STATE                         */
/* ---------------------------------- */

function EmptyState() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center px-6">
      <MaterialIcons
        name="event"
        size={72}
        color={isDark ? "#6b7280" : "#9ca3af"}
        style={{ marginBottom: 16 }}
      />

      <Text
        className="text-lg font-semibold text-center"
        style={{ color: isDark ? "#f5f5f5" : "#111827" }}
      >
        No sessions
      </Text>

      <Text
        className="mt-1 text-sm text-center"
        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
      >
        Your sessions will appear here
      </Text>
    </View>
  );
}

/* ---------------------------------- */
/* CARD + SMALL COMPONENTS             */
/* ---------------------------------- */

function BookingCard({
  data,
  primaryAction,
  secondaryAction,
  onPrimaryPress,
  onSecondaryPress,
}: any) {
  return (
    <View
      className="mb-5 rounded-3xl 
      bg-card-light dark:bg-card-dark 
      border border-border-light dark:border-border-dark 
      overflow-hidden"
    >
      {/* CONTENT */}
      <View className="flex-row gap-4 p-4">
        {/* IMAGE */}
        <View className="w-24 h-24 rounded-2xl overflow-hidden mt-1">
          <Image
            source={{ uri: data.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* RIGHT SIDE */}
        <View className="flex-1 justify-between">
          <View>
            <Text
              className="text-base font-semibold 
              text-text-primary-light dark:text-text-primary-dark"
            >
              {data.title}
            </Text>

            <Text
              className="text-sm mt-0.5 
              text-text-secondary-light dark:text-text-secondary-dark"
            >
              {data.subtitle}
            </Text>

            <View className="mt-3 gap-2">
              <InfoRow icon="calendar-today" text={data.date} />
              <InfoRow icon="location-on" text={data.location} />
            </View>
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      {(primaryAction || secondaryAction) && (
        <View
          className="flex-row gap-3 
          px-4 pb-4 
          border-t border-border-light dark:border-border-dark pt-3"
        >
          {secondaryAction && (
            <ActionButton
              text={secondaryAction}
              variant="secondary"
              onPress={onSecondaryPress}
            />
          )}
          {primaryAction && (
            <ActionButton
              text={primaryAction}
              variant="primary"
              onPress={onPrimaryPress}
            />
          )}
        </View>
      )}
    </View>
  );
}

function InfoRow({ icon, text }: any) {
  return (
    <View className="flex-row items-center gap-2">
      <MaterialIcons name={icon} size={16} color="#FF9500" />
      <Text
        className="text-sm 
        text-text-secondary-light dark:text-text-secondary-dark"
      >
        {text}
      </Text>
    </View>
  );
}
function ActionButton({ text, variant, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={`flex-1 py-2.5 items-center justify-center rounded-2xl ${
        variant === "primary"
          ? "bg-primary"
          : "bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          variant === "primary"
            ? "text-white"
            : "text-text-primary-light dark:text-text-primary-dark"
        }`}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
