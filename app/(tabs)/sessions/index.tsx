import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* JSON DATA                           */
/* ---------------------------------- */

const bookingsData = {
  upcoming: [
    {
      id: "1",
      title: "Vinyasa Flow Yoga",
      subtitle: "at Serenity Studio",
      date: "Mon, 28 Oct - 9:00 AM",
      location: "SoHo, Manhattan",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Xmf0IZ96SoC3VOC0yzgHi6D0bL8iXKY5Ayq72gI3ZQIYyGp1m3aDiHizwSkLa48JbMEvyd-90Cq-9y_O7w_vPKfNyqPvRR28hC16sn1jbsSqeZ8tqCtaCTZkfTRqasbMDH5zap87h6_bDra78DJN2mCeFhkN8vz8TKu3SWg-Mmbe8UwrYWsWx34cPlYHNJMv_QDSssTjKDPSJaKKoc77jqTT5qpGwQ0cy8_kKTiuRS5tGJNGS1jpY6h4OpxBix-v2XrMCVlolE86",
    },
    {
      id: "2",
      title: "Strength Training",
      subtitle: "at Iron Core Gym",
      date: "Wed, 30 Oct - 6:00 PM",
      location: "Brooklyn",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    },
  ],
  past: [
    {
      id: "3",
      title: "HIIT Cardio Blast",
      subtitle: "at Pulse Fitness",
      date: "19 Oct - 10:00 AM",
      location: "Midtown East",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDVX1KVCRgUajchvMngiwPNsQZmwr7uwWER3VN0MjWFrXHo_gzyiqGGT7i27K8yd_boiX5ATONulV-W_Vc1reB23Rc9c3IudzAmJvCp3BuNygQ9KlpgdWNJfPhbRRqZRZqKtDR2kemjF2LKaGXmVO88SQUiclC2v5Xs3LjKfE9znYy7gkDHHi6P2_O9M33AHkFiPS3Jj6ILyR6gXs9vr9kcq5o58bQGHM-coimpiz5uIAp38DUeV_HGLRdJJCLvubcPg7P4n0p8CqFD",
    },
    {
      id: "4",
      title: "Morning Pilates",
      subtitle: "at Flex Studio",
      date: "10 Oct - 7:00 AM",
      location: "Upper East Side",
      image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3",
    },
  ],
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function BookingsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const data =
    activeTab === "upcoming" ? bookingsData.upcoming : bookingsData.past;

  const iconColor = isDark ? "#f5f5f5" : "#000000";

  return (
    <SafeAreaView
      edges={["top"]}
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
            onPress={() => setActiveTab(tab as "upcoming" | "past")}
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
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: data.length === 0 || loading ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color={"#ff7b00"} />
          </View>
        )}

        {!loading &&
          (data.length === 0 ? (
            <EmptyState />
          ) : (
            data.map((item) => (
              <BookingCard
                key={item.id}
                data={item}
                primaryAction={activeTab === "upcoming" ? "View QR" : null}
                secondaryAction={activeTab === "upcoming" ? "Cancel" : null}
                onPrimaryPress={() => {
                  if (activeTab === "upcoming") {
                    router.push(`/(stack)/qr/${item.id}`);
                  }
                }}
                onSecondaryPress={() => {
                  if (activeTab === "upcoming") {
                    Alert.alert("Clicked Cancel");
                  }
                }}
              />
            ))
          ))}
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
