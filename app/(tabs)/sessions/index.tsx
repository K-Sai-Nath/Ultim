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
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "upcoming" | "ongoing" | "past";

// Computes the start & end Date objects for a booking's session.
// duration is treated as MINUTES.
const getSessionBounds = (b: any): { start: Date; end: Date } => {
  const start = new Date(b.sessionDate);
  const [hourStr, minuteStr] = (b.sessionTime || "0:0").split(":");
  start.setHours(parseInt(hourStr, 10) || 0, parseInt(minuteStr, 10) || 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Math.round(b.duration || 0));

  return { start, end };
};

export default function BookingsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

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
    // Keep upcoming/ongoing/past buckets fresh as time passes
    refetchInterval: 1000 * 60,
  });

  const bookings = data?.pages.flatMap((page) => page.docs) || [];

  const now = new Date();

  const upcoming = useMemo(() => {
    return bookings.filter((b: any) => {
      const { start } = getSessionBounds(b);
      return start > now;
    });
  }, [bookings]);

  const ongoing = useMemo(() => {
    return bookings.filter((b: any) => {
      const { start, end } = getSessionBounds(b);
      return start <= now && end >= now;
    });
  }, [bookings]);

  const past = useMemo(() => {
    return bookings.filter((b: any) => {
      const { end } = getSessionBounds(b);
      return end < now;
    });
  }, [bookings]);

  const filteredData =
    activeTab === "upcoming" ? upcoming : activeTab === "ongoing" ? ongoing : past;

  const emptyStateMessage =
    activeTab === "upcoming"
      ? "No upcoming bookings found"
      : activeTab === "ongoing"
      ? "No ongoing sessions right now"
      : "No past bookings found";

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load bookings.";

  const iconColor = isDark ? "#f5f5f5" : "#000";

  // Formats a 24h "HH:mm" string to a zero-padded 24h "HH:mm" string
  const formatTime = (time: string) => {
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const hh = hour.toString().padStart(2, "0");
    const mm = minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Adds `duration` MINUTES to a "HH:mm" start time
  const addDuration = (time: string, duration: number) => {
    const [hourStr, minuteStr] = time.split(":");
    const start = new Date();
    start.setHours(parseInt(hourStr, 10));
    start.setMinutes(parseInt(minuteStr, 10));
    start.setMinutes(start.getMinutes() + Math.round(duration || 0));
    const hh = start.getHours().toString().padStart(2, "0");
    const mm = start.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const renderItem = ({ item }: any) => {
    const dateObj = new Date(item.sessionDate);
    const dayNumber = dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });

    const startTime = formatTime(item.sessionTime);
    const endTime = formatTime(addDuration(item.sessionTime, item.duration));

    const membershipType = item.membership?.membershipPlan?.type;

    // Both upcoming and ongoing sessions need the QR — upcoming to check in,
    // ongoing to check out / re-enter.
    const showQr = activeTab === "upcoming" || activeTab === "ongoing";

    return (
      <BookingCard
        data={{
          type: membershipType,
          date: dayNumber,
          weekday,
          timeRange: `${startTime} - ${endTime}`,
          duration: item.duration,
          venue: item.tenant?.Facility,
          address: item.tenant?.address,
          court:
            typeof item.court === "string" && item.court.trim().length > 0
              ? item.court.trim()
              : null,
          isOngoing: activeTab === "ongoing",
        }}
        primaryAction={showQr ? "View QR" : null}
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

      <View className="flex-row border-b border-border-light dark:border-border-dark">
        {(["upcoming", "ongoing", "past"] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
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
              {tab === "upcoming"
                ? "Upcoming"
                : tab === "ongoing"
                ? "Ongoing"
                : "Past"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
/* CARD COMPONENTS                    */
/* ---------------------------------- */

const ACCESS_THEME: Record<string, { accent: string; icon: string }> = {
  gym: { accent: "#FF7A00", icon: "fitness-center" },
  badminton: { accent: "#FFC107", icon: "sports-tennis" },
  swimming: { accent: "#11C5FF", icon: "pool" },
  pickleball: { accent: "#FF5A36", icon: "sports-tennis" },
  football: { accent: "#45D61B", icon: "sports-soccer" },
  yoga: { accent: "#B98CFF", icon: "self-improvement" },
  health: { accent: "#B98CFF", icon: "favorite" },
  default: { accent: "#8B5CF6", icon: "event" },
};

function BookingCard({
  data,
  primaryAction,
  secondaryAction,
  onPrimaryPress,
  onSecondaryPress,
}: any) {
  const theme =
    ACCESS_THEME[data.type?.toLowerCase()] ?? ACCESS_THEME.default;
  const accent = theme.accent;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: "100%",
        borderRadius: 16,
        backgroundColor: "#0B0B0B",
        borderWidth: 1,
        borderColor: accent,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {/* Top row: sport | date | time */}
      <View style={{ flexDirection: "row" }}>
        {/* Sport */}
        <View style={{ flex: 1.1, flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1.5,
              borderColor: accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name={theme.icon as any} size={16} color={accent} />
          </View>
          <View style={{ marginLeft: 8, flexShrink: 1 }}>
            <Text style={{ color: "#7D7D7D", fontSize: 9, letterSpacing: 0.4 }}>
              SPORT
            </Text>
            <Text
              style={{ color: "#FFF", fontSize: 13, fontWeight: "700",textTransform: "uppercase" }}
              numberOfLines={1}
            >
              {data.type || "Session"}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: "rgba(255,255,255,.12)",
            marginHorizontal: 10,
          }}
        />

        {/* Date */}
        <View style={{ flex: 0.8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MaterialIcons name="calendar-month" size={12} color={accent} />
            <Text style={{ color: "#7D7D7D", fontSize: 9, letterSpacing: 0.4 }}>
              DATE
            </Text>
          </View>
          <Text
            style={{
              color: "#FFF",
              fontSize: 12,
              fontWeight: "700",
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {data.date}
          </Text>
          <Text style={{ color: "#7D7D7D", fontSize: 10 }}>{data.weekday}</Text>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: "rgba(255,255,255,.12)",
            marginHorizontal: 10,
          }}
        />

        {/* Time */}
        <View style={{ flex: 1.1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MaterialIcons name="schedule" size={12} color={accent} />
            <Text style={{ color: "#7D7D7D", fontSize: 9, letterSpacing: 0.4 }}>
              TIME
            </Text>
          </View>
          <Text
            style={{
              color: "#FFF",
              fontSize: 11,
              fontWeight: "700",
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {data.timeRange}
          </Text>
          <Text style={{ color: "#7D7D7D", fontSize: 10 }}>
            {(data.duration / 60).toFixed(1).replace(/\.0$/, "")} hrs
          </Text>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,.12)",
          marginVertical: 12,
        }}
      />

      {/* Bottom row: venue | court | action button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            paddingRight: 8,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="apartment" size={16} color={accent} />
          </View>
          <View style={{ marginLeft: 8, flexShrink: 1 }}>
            <Text style={{ color: "#7D7D7D", fontSize: 9, letterSpacing: 0.4 }}>
              VENUE
            </Text>
            <Text
              style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }}
              numberOfLines={1}
            >
              {data.venue}
            </Text>
            {!!data.address && (
              <Text
                style={{ color: "#7D7D7D", fontSize: 10 }}
                numberOfLines={1}
              >
                {data.address}
              </Text>
            )}
          </View>
        </View>

        {!!data.court && (
          <>
            <View
              style={{
                width: 1,
                alignSelf: "stretch",
                backgroundColor: "rgba(255,255,255,.12)",
                marginHorizontal: 10,
              }}
            />

            <View style={{ flex: 0.8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialIcons name="sports-tennis" size={12} color={accent} />
                <Text style={{ color: "#7D7D7D", fontSize: 9, letterSpacing: 0.4 }}>
                  COURT
                </Text>
              </View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {data.court}
              </Text>
            </View>
          </>
        )}

        {(primaryAction || secondaryAction) && (
          <View style={{ flexDirection: "row", gap: 8, marginLeft: 8 }}>
            {secondaryAction && (
              <ActionButton
                text={secondaryAction}
                variant="secondary"
                accent={accent}
                onPress={onSecondaryPress}
              />
            )}

            {primaryAction && (
              <ActionButton
                text={primaryAction}
                variant="primary"
                accent={accent}
                onPress={onPrimaryPress}
              />
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ActionButton({ text, variant, onPress, accent }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: variant === "primary" ? accent : "transparent",
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: accent,
        gap: 6,
      }}
    >
      {variant === "primary" && (
        <MaterialIcons name="qr-code-2" size={14} color="#000" />
      )}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 0.5,
          color: variant === "primary" ? "#000" : accent,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}