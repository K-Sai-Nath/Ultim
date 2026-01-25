import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK DATA                           */
/* ---------------------------------- */

const user = {
  name: "Alex",
  credits: 120,
  planCycle: "Monthly", // ← NEW
};

const todayBookings = {
  gym: {
    booked: false,
  },
  badminton: {
    booked: true,
    time: "4:30 PM - 5:30 PM",
  },
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="ml-3">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome back, {user.name}
          </Text>
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            Premium Member
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(stack)/notifications")}
          className="w-10 h-10 rounded-full items-center justify-center bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark"
        >
          <MaterialIcons
            name="notifications"
            size={20}
            color={isDark ? "#f5f5f5" : "#000"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Available Credits */}
        <View className="px-4 mt-4">
          <View className="relative overflow-hidden rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
            <View className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10" />

            <View className="p-6">
              <Text className="text-sm font-bold uppercase text-text-secondary-light dark:text-text-secondary-dark">
                Available Credits
              </Text>

              <View className="flex-row items-end gap-1 mt-1">
                <Text className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {user.credits}
                </Text>
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  pts
                </Text>
              </View>

              {/* Bottom Row */}
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-xs italic text-text-secondary-light dark:text-text-secondary-dark">
                  Next billing: Oct 12
                </Text>

                {/* Monthly / Yearly */}
                <Text className="text-xs font-semibold text-primary">
                  {user.planCycle}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-8">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
            Quick Actions
          </Text>

          <View className="flex-row gap-3">
            <QuickAction
              icon="event-available"
              label="Book Slot"
              onPressEvent={() => router.push("/(tabs)/access")}
            />
            <QuickAction
              icon="qr-code"
              label="My Bookings"
              onPressEvent={() => router.push("/(tabs)/sessions")}
            />
            <QuickAction
              icon="account-balance-wallet"
              label="Wallet"
              onPressEvent={() => router.push("/(stack)/subscription")}
            />
          </View>
        </View>

        {/* Today's Booking */}
        <View className="px-4 mt-10 pb-8">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
            Today’s Booking
          </Text>

          <TodayBookingCard
            title="General Gym Session"
            location="Main Fitness Center, Floor 2"
            booked={todayBookings.gym.booked}
            image="https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
            onGenerateQR={() => router.push("/access")}
            onViewDetails={() => router.push("/(stack)/qr/1")}
          />

          {todayBookings.badminton.booked && (
            <TodayBookingCard
              title="Badminton Session"
              time={todayBookings.badminton.time}
              location="Court 2"
              booked
              image="https://loremflickr.com/400/400/badminton"
              onGenerateQR={() => {}}
              onViewQR={() => router.push("/(stack)/qr/1")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function QuickAction({ icon, label, onPressEvent }: any) {
  return (
    <TouchableOpacity
      onPress={onPressEvent}
      className="flex-1 aspect-square rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark items-center justify-center gap-2"
    >
      <View className="w-12 h-12 rounded-lg bg-primary/10 items-center justify-center">
        <MaterialIcons name={icon} size={26} color="#ff7b00" />
      </View>
      <Text className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TodayBookingCard({
  booked,
  title,
  time,
  location,
  image,
  onViewQR,
  onGenerateQR,
}: any) {
  return (
    <View
      className="
        mb-6 rounded-2xl overflow-hidden
        bg-card-light dark:bg-card-dark
        border border-border-light dark:border-border-dark
      "
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      {/* Top content */}
      <View className="flex-row p-5 gap-4">
        <Image
          source={{ uri: image }}
          className="w-24 h-24 rounded-xl"
          resizeMode="cover"
        />

        <View className="flex-1 justify-center">
          {time && (
            <View className="self-start mb-1 px-2.5 py-1 rounded-full bg-primary/10">
              <Text className="text-[10px] font-bold uppercase text-primary">
                {time}
              </Text>
            </View>
          )}

          <Text className="text-lg font-extrabold text-text-primary-light dark:text-text-primary-dark">
            {title}
          </Text>

          <View className="flex-row items-center gap-1.5 mt-1">
            <MaterialIcons name="location-on" size={14} color="#9ca3af" />
            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {location}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-px bg-border-light dark:bg-border-dark mx-5" />

      <View className="flex-row items-center justify-between px-5 py-4">
        {booked ? (
          <>
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Confirmed
              </Text>
            </View>

            <TouchableOpacity
              onPress={onViewQR}
              activeOpacity={0.85}
              className="px-4 py-2 rounded-xl bg-primary/10"
            >
              <Text className="text-xs font-bold text-primary">View QR →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onGenerateQR}
            activeOpacity={0.9}
            className="ml-auto px-5 py-2.5 rounded-xl bg-primary"
          >
            <Text className="text-xs font-bold text-white tracking-wide">
              Generate QR
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
