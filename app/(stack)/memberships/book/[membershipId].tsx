import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* HELPERS                            */
/* ---------------------------------- */

const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const formatDateNumber = (date: Date) => date.getDate();

/* ---------------------------------- */
/* SCREEN                             */
/* ---------------------------------- */
export default function SlotsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { membershipId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f5f5f5" : "#000";
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(
    null,
  );
  const [duration, setDuration] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  /* ---------------------------------- */
  /* FETCH PLAN                         */
  /* ---------------------------------- */

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = await getAccessToken();

        const res = await axios.get(
          `https://ultim-server.vercel.app/api/memberships/${membershipId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setPlan(res.data);
      } catch (err) {
        console.log("Plan fetch error:", err);
        Alert;
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) fetchPlan();
  }, [membershipId]);

  /* ---------------------------------- */
  /* Generate 3 Dates                   */
  /* ---------------------------------- */

  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const selectedDate = availableDates[selectedDateIndex];

  /* ---------------------------------- */
  /* Backend Slots                      */
  /* ---------------------------------- */
  const availableStartHours = useMemo(() => {
    if (!plan?.membershipPlan?.timeSlots) return [];

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    return plan.membershipPlan.timeSlots
      .map((slot: any) => parseInt(slot.slotStartTime.split(":")[0]))
      .filter((hour: number) => {
        if (!isToday) return true;
        return hour > now.getHours();
      })
      .sort((a: number, b: number) => a - b);
  }, [plan, selectedDate]);
  const totalCredits =
    duration * (plan?.membershipPlan.numberOfCreditsPerSession || 0);
  const endHour =
    selectedStartHour !== null ? selectedStartHour + duration : null;
  /* ---------------------------------- */
  /* Confirm Booking                    */
  /* ---------------------------------- */

  const handleConfirmBooking = () => {
    if (selectedStartHour === null) return;

    Alert.alert(
      "Confirm Booking",
      `Book on ${selectedDate.toDateString()} from ${formatHour(
        selectedStartHour,
      )} to ${formatHour(endHour!)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setBookingLoading(true);

              const token = await getAccessToken();
              if (!token) throw new Error("No token");
              console.log(
                user?.id,
                membershipId,
                selectedDate.toISOString(),
                formatHour(selectedStartHour),
              );
              await axios.post(
                "https://ultim-server.vercel.app/api/bookings",
                {
                  member: user?.id,
                  tenant: 3,
                  membership: Number(membershipId),
                  sessionDate: selectedDate.toISOString(),
                  sessionTime: formatHour(selectedStartHour),
                  duration: duration,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              queryClient.invalidateQueries({ queryKey: ["bookings"] });
              queryClient.invalidateQueries({ queryKey: ["plans"] });
              Alert.alert(
                "Booking Confirmed 🎉",
                "Check bookings tab for details",
              );

              router.back(); // optional: go back after booking
            } catch (error) {
              let message = "Unable to complete booking. Please try again.";

              if (axios.isAxiosError(error)) {
                console.log("Axios Error:", error.toJSON());
                const data = error.response?.data;
                if (data?.errors && Array.isArray(data.errors)) {
                  message = data.errors.map((e: any) => e.message).join("\n");
                } else if (data?.message) {
                  message = data.message;
                }
              } else {
                console.log("Unexpected Error:", error);
              }
              Alert.alert("Booking Failed ❌", message);
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ],
    );
  };
  /* ---------------------------------- */
  /* LOADING STATE                      */
  /* ---------------------------------- */

  if (loading || !plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#ff7b00" />
        <Text className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
          Loading slots...
        </Text>
      </SafeAreaView>
    );
  }

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
          Booking
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* DATE SELECTOR */}
        <View className="px-4 mt-6">
          <Text className="pb-3 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Select Date
          </Text>

          <View className="flex-row gap-3">
            {availableDates.map((date, index) => {
              const selected = index === selectedDateIndex;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDateIndex(index);
                    setSelectedStartHour(null);
                    setDuration(1);
                  }}
                  className={`flex-1 h-20 items-center justify-center rounded-xl border ${
                    selected
                      ? "bg-primary border-primary"
                      : "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase ${
                      selected
                        ? "text-white/80"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    }`}
                  >
                    {formatDay(date)}
                  </Text>

                  <Text
                    className={`text-xl font-bold ${
                      selected
                        ? "text-white"
                        : "text-text-primary-light dark:text-text-primary-dark"
                    }`}
                  >
                    {formatDateNumber(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* START TIME TILES */}
        <View className="px-4 mt-6">
          <Text className="pb-3 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Select Start Time
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {availableStartHours.map((hour: number) => {
              const selected = selectedStartHour === hour;

              return (
                <TouchableOpacity
                  key={hour}
                  onPress={() => {
                    setSelectedStartHour(hour);
                    setDuration(1);
                  }}
                  className={`w-[30%] rounded-xl p-3 border ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      selected
                        ? "text-primary"
                        : "text-text-primary-light dark:text-text-primary-dark"
                    }`}
                  >
                    {formatHour(hour)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* DURATION */}
        {selectedStartHour !== null && (
          <View className="px-4 mt-6">
            <Text className="pb-3 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              Duration
            </Text>

            <View className="flex-row justify-between items-center p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
              <Text className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                {duration} hour(s)
              </Text>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  disabled={duration <= 1}
                  onPress={() => setDuration(duration - 1)}
                  className="w-10 h-10 rounded-full bg-border-light dark:bg-border-dark items-center justify-center"
                >
                  <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                    -
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (duration < 2) {
                      setDuration(duration + 1);
                    }
                  }}
                  disabled={duration >= 2}
                  className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                >
                  <Text className="text-white text-lg font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM SUMMARY */}
      {selectedStartHour !== null && (
        <SafeAreaView
          edges={["bottom"]}
          className="absolute bottom-0 left-0 right-0"
        >
          <View className="mx-4 mb-4 p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-xs uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                  Credits
                </Text>
                <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                  {totalCredits}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs uppercase font-bold text-text-secondary-light dark:text-text-secondary-dark">
                  Timings (24h)
                </Text>
                <Text className="text-sm font-semibold text-primary">
                  {formatHour(selectedStartHour)} - {formatHour(endHour!)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleConfirmBooking}
              disabled={bookingLoading}
              className={`
    w-full py-4 rounded-xl items-center justify-center
    ${bookingLoading ? "bg-primary/60" : "bg-primary"}
  `}
            >
              {bookingLoading ? (
                <ActivityIndicator color={isDark ? "#ffffff" : "#000000"} />
              ) : (
                <Text className="font-bold text-base text-white dark:text-black">
                  Confirm Booking
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
