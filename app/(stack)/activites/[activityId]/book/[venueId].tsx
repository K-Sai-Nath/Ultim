import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK BACKEND DATA                   */
/* ---------------------------------- */

const FACILITY_INFO = {
  name: "Olympic Arena - Court 4",
  creditsPerHour: 10,
  image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
};

const CREDITS_REQUIRED = 10;
const ONE_DAY = 24 * 60 * 60 * 1000;

const SLOTS_BY_DATE = [
  {
    date: new Date(),
    slots: [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
    ],
  },
  {
    date: new Date(Date.now() + ONE_DAY),
    slots: ["06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM"],
  },
  {
    date: new Date(Date.now() + 2 * ONE_DAY),
    slots: ["05:00 PM - 06:00 PM", "06:00 PM - 07:00 PM"],
  },
];

/* ---------------------------------- */
/* HELPERS                            */
/* ---------------------------------- */

const formatDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" });

const formatDate = (d: Date) => d.getDate();
const handleConfirmBooking = () => {
  Alert.alert(
    "Confirm Booking",
    "Are you sure you want to confirm this booking?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        style: "default",
        onPress: () => {
          Alert.alert(
            "Booking Confirmed 🎉",
            "You can check the details in the bookings tab"
          );
        },
      },
    ]
  );
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function SlotsScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000";

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const currentSlots = SLOTS_BY_DATE[selectedDateIndex].slots;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Select Slot
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* DATE PICKER */}
        <View className="mt-2">
          <Text className="px-4 pb-3 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Select Date
          </Text>

          <View className="flex-row px-4 gap-3">
            {SLOTS_BY_DATE.map((item, index) => {
              const selected = index === selectedDateIndex;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDateIndex(index);
                    setSelectedSlot(null);
                  }}
                  className={`flex-1 h-20 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-primary"
                      : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase ${
                      selected
                        ? "text-white/80"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    }`}
                  >
                    {formatDay(item.date)}
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      selected
                        ? "text-white"
                        : "text-text-primary-light dark:text-text-primary-dark"
                    }`}
                  >
                    {formatDate(item.date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FACILITY CARD */}
        <View className="px-4 py-4">
          <View className="flex-row items-center gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark">
            {/* LEFT IMAGE */}
            <Image
              source={{ uri: FACILITY_INFO.image }}
              className="w-24 h-24 rounded-lg"
              resizeMode="cover"
            />

            {/* RIGHT CONTENT */}
            <View className="flex-1 justify-center">
              <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {FACILITY_INFO.name}
              </Text>

              <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {FACILITY_INFO.creditsPerHour} credits / hour
              </Text>
            </View>
          </View>
        </View>

        {/* SLOTS */}
        <View className="mt-2">
          <Text className="px-4 pb-3 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Available Slots
          </Text>

          <View className="px-4 flex-row flex-wrap gap-3">
            {currentSlots.map((slot) => {
              const selected = selectedSlot === slot;

              return (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedSlot(slot)}
                  className={`w-[48%] rounded-xl p-4 border ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
                  }`}
                >
                  <MaterialIcons
                    name="schedule"
                    size={20}
                    color={selected ? "#ff7b00" : "#9ca3af"}
                  />
                  <Text className="mt-2 text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM ACTION – MATCHES GYM CARD */}
      {selectedSlot && (
        <SafeAreaView
          edges={["bottom"]}
          className="absolute bottom-0 left-0 right-0"
        >
          <View className="mx-4 mb-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            {/* INFO ROW */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xs uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                  Credits
                </Text>
                <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                  {CREDITS_REQUIRED}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                  Selected Slot
                </Text>
                <Text className="text-sm font-semibold text-primary">
                  {selectedSlot}
                </Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleConfirmBooking}
              activeOpacity={0.9}
              className="w-full py-4 rounded-xl bg-primary"
            >
              <Text className="text-center text-white font-bold text-base">
                Confirm Booking
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
