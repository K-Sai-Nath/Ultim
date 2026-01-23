import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* DATA (backend sends ONLY date)      */
/* ---------------------------------- */

const notifications = [
  {
    id: "1",
    title: "HIIT Class Confirmed!",
    message: "Your session at Power Gym is set for 6 PM.",
    createdAt: "2026-01-19T10:30:00Z",
  },
  {
    id: "2",
    title: "Yoga Session Reminder",
    message: "Your class at Serenity Studio starts in 1 hour.",
    createdAt: "2026-01-19T09:40:00Z",
  },
  {
    id: "3",
    title: "50 Credits Added",
    message: "Your top-up was successful. Happy booking!",
    createdAt: "2026-01-18T12:00:00Z",
  },
  {
    id: "4",
    title: "Booking Cancelled",
    message: "Your Spin class booking has been cancelled.",
    createdAt: "2026-01-16T15:00:00Z",
  },
  {
    id: "5",
    title: "New Venue Alert!",
    message: "Get 20% off your first booking at Zen Studio.",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "6",
    title: "Low Credit Balance",
    message: "Top up now to continue booking new classes.",
    createdAt: "2026-01-10T07:00:00Z",
  },
];

/* ---------------------------------- */
/* DATE HELPERS                        */
/* ---------------------------------- */

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameWeek = (date: Date) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
};

const timeAgo = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function NotificationsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000000";
  const now = new Date();

  const today = notifications.filter((n) =>
    isSameDay(new Date(n.createdAt), now)
  );

  const thisWeek = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    return !isSameDay(d, now) && isSameWeek(d);
  });

  const older = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    return !isSameWeek(d);
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Notifications
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
      >
        <Section title="Today" data={today} />
        <Section title="This Week" data={thisWeek} />
        <Section title="Older" data={older} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function Section({
  title,
  data,
}: {
  title: string;
  data: typeof notifications;
}) {
  if (data.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="px-2 pb-3 text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
        {title}
      </Text>

      <View className="gap-3">
        {data.map((item) => (
          <NotificationItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

function NotificationItem({ item }: { item: any }) {
  return (
    <View className="flex-row gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark">
      {/* SINGLE FIXED ICON */}
      <View className="w-10 h-10 items-center justify-center">
        <MaterialIcons name="notifications" size={26} color="#ff7b00" />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="font-bold text-text-primary-light dark:text-text-primary-dark">
          {item.title}
        </Text>
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {item.message}
        </Text>
      </View>

      {/* Time */}
      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
        {timeAgo(new Date(item.createdAt))}
      </Text>
    </View>
  );
}
