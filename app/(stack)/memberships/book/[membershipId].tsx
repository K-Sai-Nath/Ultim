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
const formatHour = (hourNumber: number) => {
  const date = new Date();
  
  // Extract hours and convert fractional hours (e.g., 0.5) cleanly into minutes
  const hours = Math.floor(hourNumber);
  const minutes = Math.round((hourNumber - hours) * 60);
  
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

const formatDateMonth = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

const formatDateNumber = (date: Date) => date.getDate();

/* ---------------------------------- */
/* STATIC COURT DATA                  */
/* ---------------------------------- */
const COURTS = [
  { id: 1, name: "Court 1" },
  { id: 2, name: "Court 2" },
  { id: 3, name: "Court 3" },
];

const COURT_SPORT_TYPES = ["pickleball", "badminton", "gym"];

const getCourtAvailability = (
  hour: number | null,
  dateIndex: number,
): Record<number, boolean> => {
  if (hour === null) {
    return COURTS.reduce(
      (acc, c) => ({ ...acc, [c.id]: true }),
      {} as Record<number, boolean>,
    );
  }

  const availability: Record<number, boolean> = {};
  COURTS.forEach((court) => {
    const seed = (hour + dateIndex + court.id) % 3;
    availability[court.id] = seed !== 0; 
  });
  return availability;
};

/* ---------------------------------- */
/* SCREEN                             */
/* ---------------------------------- */
export default function SlotsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { membershipId } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
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
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) fetchPlan();
  }, [membershipId]);

  /* ---------------------------------- */
  /* Generate 3 Dates (Logic Unchanged) */
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
  const planType = (plan?.membershipPlan?.type || "").toLowerCase();
  const isCourtSport = COURT_SPORT_TYPES.includes(planType);

  const courtAvailability = useMemo(
    () => getCourtAvailability(selectedStartHour, selectedDateIndex),
    [selectedStartHour, selectedDateIndex],
  );

  // Dynamic counter to show how many courts are available out of the total count
  const availableCourtsCount = useMemo(() => {
    return COURTS.filter(court => courtAvailability[court.id]).length;
  }, [courtAvailability]);

  /* ---------------------------------- */
  /* Backend Slots                      */
  /* ---------------------------------- */
  const availableStartHours = useMemo(() => {
    if (!plan?.membershipPlan?.timeSlots) {
      return [16, 17, 18, 19, 20, 21, 22];
    }

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
    duration * (plan?.membershipPlan?.numberOfCreditsPerSession || 0);
  const endHour =
    selectedStartHour !== null ? selectedStartHour + duration : null;

  const canConfirm =
    selectedStartHour !== null && (!isCourtSport || selectedCourt !== null);

  /* ---------------------------------- */
  /* Confirm Booking                    */
  /* ---------------------------------- */
  const handleConfirmBooking = () => {
    if (selectedStartHour === null) return;
    if (isCourtSport && selectedCourt === null) return;

    const courtLabel = isCourtSport
      ? `\nCourt: ${COURTS.find((c) => c.id === selectedCourt)?.name}`
      : "";

    Alert.alert(
      "Confirm Booking",
      `Book on ${selectedDate.toDateString()} from ${formatHour(
        selectedStartHour,
      )} to ${formatHour(endHour!)}?${courtLabel}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setBookingLoading(true);
              const token = await getAccessToken();
              if (!token) throw new Error("No token");

              await axios.post(
                "https://ultim-server.vercel.app/api/bookings",
                {
                  member: user?.id,
                  tenant: 3,
                  membership: Number(membershipId),
                  sessionDate: selectedDate.toISOString(),
                  sessionTime: formatHour(selectedStartHour),
                  duration: duration,
                  ...(isCourtSport ? { court: selectedCourt } : {}),
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
              router.back();
            } catch (error) {
              let message = "Unable to complete booking. Please try again.";
              if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                if (data?.errors && Array.isArray(data.errors)) {
                  message = data.errors.map((e: any) => e.message).join("\n");
                } else if (data?.message) {
                  message = data.message;
                }
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

  if (loading || !plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0d0d0d]">
        <ActivityIndicator size="large" color="#ff5500" />
        <Text className="mt-4 text-neutral-400 font-medium">Loading slots...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white tracking-wide">
          Booking
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 220 }} showsVerticalScrollIndicator={false}>
        {/* DATE SELECTOR */}
        <View className="px-4 mt-4">
          <Text className="pb-3 text-[15px] font-bold text-white tracking-wide">
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
                    setSelectedCourt(null);
                    setDuration(1);
                  }}
                  className="flex-1 h-[84px] items-center justify-center rounded-xl border"
                  style={{
                    backgroundColor: "#121212",
                    borderColor: selected ? "#ff5500" : "#1e1e1e",
                    borderWidth: selected ? 1.5 : 1,
                  }}
                >
                  <Text
                    className="text-[10px] font-bold tracking-wider"
                    style={{ color: selected ? "#ff5500" : "#737373" }}
                  >
                    {formatDay(date)}
                  </Text>

                  <Text className="text-xl font-black text-white my-0.5">
                    {formatDateNumber(date)}
                  </Text>

                  <Text
                    className="text-[9px] font-bold tracking-wider"
                    style={{ color: selected ? "#ff5500" : "#525252" }}
                  >
                    {formatDateMonth(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* TIME & SLIDABLE TIMELINE SECTION */}
        {availableStartHours.length > 0 ? (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between pb-4">
              <Text className="text-[15px] font-bold text-white tracking-wide">
                Available Times
              </Text>

              <View className="flex-row items-center rounded-xl bg-[#161616] p-1 border border-neutral-800">
                <TouchableOpacity
                  disabled={duration <= 1}
                  onPress={() => setDuration(duration - 0.5)}
                  className="w-7 h-7 rounded-lg items-center justify-center bg-neutral-900"
                >
                  <Text className="text-neutral-400 text-sm font-bold">−</Text>
                </TouchableOpacity>

                <Text className="mx-3 text-[13px] font-bold text-white">
                  {duration} Hour{duration > 1 ? "s" : ""}
                </Text>

                <TouchableOpacity
                  disabled={duration >= 2}
                  onPress={() => setDuration(duration + 0.5)}
                  className="w-7 h-7 rounded-lg items-center justify-center bg-[#ff5500]"
                  style={{ opacity: duration >= 2 ? 0.4 : 1 }}
                >
                  <Text className="text-white text-sm font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SLIDABLE TIME BAR LIST */}
            <View className="bg-[#121212] rounded-xl py-4 border border-neutral-900">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
              >
                {availableStartHours.map((hour: number) => {
                  const selected = selectedStartHour === hour;

                  return (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => {
                        setSelectedStartHour(hour);
                        setSelectedCourt(null);
                      }}
                      className="rounded-lg px-4 py-2 border items-center justify-center"
                      style={{
                        backgroundColor: selected ? "rgba(255,85,0,0.15)" : "#161616",
                        borderColor: selected ? "#ff5500" : "#262626",
                        borderWidth: 1
                      }}
                    >
                      <Text
                        className="font-bold text-[13px]"
                        style={{ color: selected ? "#ff5500" : "#a3a3a3" }}
                      >
                        {formatHour(hour)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedStartHour !== null && (
                <View className="mt-3 pt-2 border-t border-neutral-900 items-center">
                  <Text className="text-[#ff5500] font-black text-[14px]">
                    {formatHour(selectedStartHour)} — {formatHour(endHour!)}
                  </Text>
                  <Text className="text-neutral-500 text-[11px] mt-0.5">
                    Selected Slots Duration: {duration} Hour{duration > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* EMPTY STATE NO SLOTS AVAILABLE WITH ARTWORK ON TOP */
          <View className="mx-4 mt-8 items-center justify-center py-12 bg-[#121212] rounded-xl border border-dashed border-neutral-850">
            <View className="w-16 h-16 rounded-full bg-neutral-900/80 items-center justify-center mb-4 border border-neutral-800">
              <MaterialIcons name="event-busy" size={32} color="#ff5500" />
            </View>
            <Text className="text-white font-extrabold text-[16px] tracking-wide">
              No Slots Available
            </Text>
            <Text className="text-neutral-500 text-xs mt-1.5 text-center px-8 leading-relaxed">
              There are no matching booking slots open for this date. Try shifting to a different day above.
            </Text>
          </View>
        )}

        {/* STATUS LEGEND INDICATORS */}
        {isCourtSport && selectedStartHour !== null && (
          <View className="flex-row items-center justify-center gap-5 mt-5">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <Text className="text-[11px] font-semibold text-neutral-400">Available</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#525252]" />
              <Text className="text-[11px] font-semibold text-neutral-400">Unavailable</Text>
            </View>
          </View>
        )}

        {/* COURT SELECTOR SECTION */}
        {isCourtSport && selectedStartHour !== null && (
          <View className="px-4 mt-5">
            <View className="flex-row items-center justify-between pb-3">
              <Text className="text-[15px] font-bold text-white tracking-wide">
                Available Courts
              </Text>
              
              {/* COURT COUNT BADGE INDICATOR */}
              <View className="bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
                <Text className="text-xs font-bold text-[#ff5500]">
                  {availableCourtsCount} / {COURTS.length} Available
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {COURTS.map((court) => {
                const available = courtAvailability[court.id];
                const selected = selectedCourt === court.id;

                // Determine appropriate sports icon type based on plan context
                let sportIconName: keyof typeof MaterialIcons.glyphMap = "sports-tennis"; // Pickleball default
                if (planType === "badminton") {
                  sportIconName = "sports-cricket"; // Clean generic racket representation
                } else if (planType === "gym") {
                  sportIconName = "fitness-center";
                }

                return (
                  <TouchableOpacity
                    key={court.id}
                    disabled={!available}
                    onPress={() => setSelectedCourt(court.id)}
                    className="w-[48.5%]"
                  >
                    <View
                      className="rounded-xl p-4 border relative items-center justify-center min-h-[130px]"
                      style={{
                        backgroundColor: "#121212",
                        borderColor: selected ? "#ff5500" : "#1a1a1a",
                        borderWidth: selected ? 1.5 : 1,
                        opacity: !available ? 0.4 : 1,
                      }}
                    >
                      {selected && (
                        <View className="absolute top-2 right-2 bg-[#ff5500] rounded-full p-0.5">
                          <MaterialIcons name="check" size={12} color="#000" />
                        </View>
                      )}

                      {/* NEW SPORT ICON DISPLAY */}
                      <View className="mb-2 w-8 h-8 rounded-full bg-neutral-900/60 items-center justify-center border border-neutral-800/80">
                        <MaterialIcons 
                          name={sportIconName} 
                          size={16} 
                          color={selected ? "#ff5500" : available ? "#737373" : "#404040"} 
                        />
                      </View>

                      <Text className="text-center font-bold text-base text-white">
                        {court.name}
                      </Text>

                      <View className="items-center mt-2">
                        <View className="flex-row items-center gap-1.5 justify-center">
                          <View 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: available ? "#22c55e" : "#525252" }} 
                          />
                          <Text 
                            className="text-[10px] font-bold tracking-wide uppercase" 
                            style={{ color: available ? "#22c55e" : "#737373" }}
                          >
                            {available ? "Available" : "Unavailable"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* COMPACT BOTTOM ASSIGNMENT OVERLAY SUMMARY */}
      {selectedStartHour !== null && (
        <View className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-neutral-900 px-4 pt-3 pb-6">
          <View className="bg-[#121212] rounded-xl border border-neutral-900 p-4 flex-row items-center mb-4">
            <View className="flex-1 flex-row flex-wrap">
              <View className="w-1/2 mb-3">
                <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Court</Text>
                <Text className="text-[13px] font-bold text-white mt-0.5">
                  {COURTS.find((c) => c.id === selectedCourt)?.name || "Not Selected"}
                </Text>
              </View>

              <View className="w-1/2 mb-3">
                <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Date</Text>
                <Text className="text-[13px] font-bold text-white mt-0.5">
                  {formatDay(selectedDate)}, {selectedDate.getDate()} {formatDateMonth(selectedDate)}
                </Text>
              </View>

              <View className="w-1/2">
                <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Duration</Text>
                <Text className="text-[13px] font-bold text-white mt-0.5">{duration} Hour{duration > 1 ? "s" : ""}</Text>
              </View>

              <View className="w-1/2">
                <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Credits</Text>
                <Text className="text-[13px] font-bold text-white mt-0.5">{totalCredits}</Text>
              </View>
            </View>

            <View className="border-l border-neutral-800 pl-4 items-start justify-center">
              <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Time</Text>
              <Text className="text-[13px] font-extrabold text-[#ff5500] mt-0.5">
                {formatHour(selectedStartHour).split(" ")[0]} - {formatHour(endHour!).split(" ")[0]} {formatHour(endHour!).split(" ")[1]}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={bookingLoading || !canConfirm}
            className="w-full h-14 rounded-xl items-center justify-center flex-row bg-[#ff5500]"
            style={{ opacity: bookingLoading || !canConfirm ? 0.6 : 1 }}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text className="font-extrabold text-base text-black tracking-wide">
                  {isCourtSport && selectedCourt === null ? "Select a Court" : "Continue to Confirm"}
                </Text>
                {!(isCourtSport && selectedCourt === null) && (
                  <MaterialIcons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 6 }} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}