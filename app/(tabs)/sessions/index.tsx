import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  const getImageForType = (type?: string) => {
    switch (type) {
      case "badminton":
        return "https://loremflickr.com/400/400/badminton";
      case "gym":
        return "https://images.unsplash.com/photo-1558611848-73f7eb4001a1";
      case "swimming":
        return "https://loremflickr.com/400/400/swimming";
      case "yoga":
        return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b";
      default:
        return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438";
    }
  };
  /* ---------------------------------- */
  /* FETCH BOOKINGS (PAGINATED)         */
  /* ---------------------------------- */

  const fetchBookings = async ({ pageParam = 1 }: { pageParam?: number }) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Please sign in again to view your bookings.");
      }

      const res = await axios.get(
        `https://ultim-server.vercel.app/api/bookings?page=${pageParam}&limit=10&sort=-createdAt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        docs: res.data?.docs || [],
        nextPage: res.data?.hasNextPage ? res.data?.nextPage : undefined,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load bookings.";
      throw new Error(message);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
  });

  const bookings = data?.pages.flatMap((page) => page.docs) || [];

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

  const filteredData = activeTab === "upcoming" ? upcoming : past;
  const emptyStateMessage =
    activeTab === "upcoming"
      ? "No upcoming bookings found"
      : "No past bookings found";
  const errorMessage =
    error instanceof Error ? error.message : "Failed to load bookings.";

  const iconColor = isDark ? "#f5f5f5" : "#000";

  /* ---------------------------------- */
  /* RENDER ITEM                        */
  /* ---------------------------------- */

  const renderItem = ({ item }: any) => {
    const dateObj = new Date(item.sessionDate);
    const dateString = dateObj.toDateString();
    const membershipType = item.membership?.membershipPlan?.type;
    return (
      <BookingCard
        data={{
          title: item.membership?.membershipPlan?.planName || "Session",
          subtitle: item.tenant?.Facility,
          date: `${dateString} - ${item.sessionTime}`,
          location: item.tenant?.Facility,
          image: getImageForType(membershipType),
        }}
        primaryAction={activeTab === "upcoming" ? "View QR" : null}
        onPrimaryPress={() => router.push(`/(stack)/qr/${item.id}`)}
      />
    );
  };

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
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff7b00" />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center">{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary rounded-xl"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color="#ff7b00"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            !isLoading && !isFetchingNextPage ? (
              <View className="mt-20 items-center px-6">
                <MaterialIcons name="event-busy" size={50} color="#999" />
                <Text className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark text-center">
                  {emptyStateMessage}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* CARD COMPONENTS (UNCHANGED)        */
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
      <View className="flex-row gap-4 p-4">
        <View className="w-24 h-24 rounded-2xl overflow-hidden mt-1">
          <Image
            source={{ uri: data.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1 justify-between">
          <View>
            <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              {data.title}
            </Text>

            <Text className="text-sm mt-0.5 text-text-secondary-light dark:text-text-secondary-dark">
              {data.subtitle}
            </Text>

            <View className="mt-3 gap-2">
              <InfoRow icon="calendar-today" text={data.date} />
              <InfoRow icon="location-on" text={data.location} />
            </View>
          </View>
        </View>
      </View>

      {(primaryAction || secondaryAction) && (
        <View className="flex-row gap-3 px-4 pb-4 border-t border-border-light dark:border-border-dark pt-3">
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
      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
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
