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
  // Extract hours and convert fractional hours (e.g., 0.5) cleanly into minutes
  const hours = Math.floor(hourNumber);
  const minutes = Math.round((hourNumber - hours) * 60);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
};

const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

const formatDateMonth = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

const formatDateNumber = (date: Date) => date.getDate();

/* ---------------------------------- */
/* COURT TYPES (dynamic, from plan)   */
/* ---------------------------------- */
type Court = {
  id: string;
  name: string;
};

// Only these plan types show a court selector at all
const COURT_SPORT_TYPES = ["pickleball", "badminton"];

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
  const [planError, setPlanError] = useState<string | null>(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  /* ---------------------------------- */
  /* FETCH PLAN                         */
  /* ---------------------------------- */
  const fetchPlan = React.useCallback(async () => {
    if (!membershipId) {
      setPlanError("This booking link looks invalid. Please go back and try again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPlanError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setPlanError("Your session has expired. Please log in again.");
        return;
      }

      const res = await axios.get(
        `https://ultim-server.vercel.app/api/memberships/${membershipId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        },
      );

      if (!res.data) {
        setPlanError("We couldn't find this membership. Please try again.");
        return;
      }

      setPlan(res.data);
    } catch (err) {
      console.log("Plan fetch error:", err);

      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          setPlanError("The request timed out. Check your connection and try again.");
        } else if (!err.response) {
          setPlanError("Unable to reach the server. Check your internet connection.");
        } else if (err.response.status === 401) {
          setPlanError("Your session has expired. Please log in again.");
        } else if (err.response.status === 404) {
          setPlanError("This membership plan could not be found.");
        } else {
          setPlanError(
            err.response.data?.message ||
              "Something went wrong while loading this plan. Please try again.",
          );
        }
      } else {
        setPlanError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [membershipId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

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

  /* ---------------------------------- */
  /* Courts — now dynamic from the API  */
  /* ---------------------------------- */
  const courts: Court[] = useMemo(() => {
    return plan?.membershipPlan?.courts || [];
  }, [plan]);

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
      ? `\nCourt: ${courts.find((c) => c.id === selectedCourt)?.name}`
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
              if (!token) {
                Alert.alert(
                  "Session Expired",
                  "Please log in again to complete this booking.",
                );
                return;
              }

              if (!membershipId) {
                Alert.alert(
                  "Booking Failed ❌",
                  "This booking session is invalid. Please go back and try again.",
                );
                return;
              }

              await axios.post(
                "https://ultim-server.vercel.app/api/bookings",
                {
                  member: user?.id,
                  tenant: 3,
                  membership: Number(membershipId),
                  sessionDate: selectedDate.toISOString(),
                  sessionTime: formatHour(selectedStartHour),
                  duration: duration*60,
                  ...(isCourtSport
                    ? { court: courts.find((c) => c.id === selectedCourt)?.name }
                    : {}),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  timeout: 15000,
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
              let title = "Booking Failed ❌";
              let message = "Unable to complete booking. Please try again.";

              if (axios.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                  message = "The request timed out. Please check your connection and try again.";
                } else if (!error.response) {
                  message = "Unable to reach the server. Check your internet connection and try again.";
                } else {
                  const status = error.response.status;
                  const data = error.response.data;

                  if (status === 401) {
                    title = "Session Expired";
                    message = "Please log in again to complete this booking.";
                  } else if (status === 409) {
                    message = "This slot was just booked by someone else. Please pick another time or court.";
                  } else if (data?.errors && Array.isArray(data.errors)) {
                    message = data.errors.map((e: any) => e.message).join("\n");
                  } else if (data?.message) {
                    message = data.message;
                  }
                }
              } else if (error instanceof Error) {
                message = error.message;
              }

              Alert.alert(title, message);
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0d0d0d]">
        <ActivityIndicator size="large" color="#ff5500" />
        <Text className="mt-4 text-neutral-400 font-medium">Loading slots...</Text>
      </SafeAreaView>
    );
  }

  if (planError || !plan) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-neutral-900/80 items-center justify-center mb-4 border border-neutral-800">
            <MaterialIcons name="error-outline" size={32} color="#ff5500" />
          </View>
          <Text className="text-white font-extrabold text-[16px] tracking-wide text-center">
            Something Went Wrong
          </Text>
          <Text className="text-neutral-500 text-xs mt-1.5 text-center leading-relaxed">
            {planError || "We couldn't load this membership plan. Please try again."}
          </Text>

          <TouchableOpacity
            onPress={fetchPlan}
            className="mt-6 h-12 px-8 rounded-xl items-center justify-center bg-[#ff5500]"
          >
            <Text className="font-extrabold text-sm text-black tracking-wide">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
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
            <View className="flex-row space-between justify-between pb-4">
              <Text className="text-[15px] font-bold text-white tracking-wide">
                Available Times
              </Text>

              <View className="flex-row items-center rounded-xl bg-[#161616] p-1 border border-neutral-800">
                <TouchableOpacity
                  disabled={duration <= 1}
                  onPress={() => setDuration(duration - 1)}
                  className="w-7 h-7 rounded-lg items-center justify-center bg-neutral-900"
                >
                  <Text className="text-neutral-400 text-sm font-bold">−</Text>
                </TouchableOpacity>

                <Text className="mx-3 text-[13px] font-bold text-white">
                  {duration} Hour{duration > 1 ? "s" : ""}
                </Text>

                <TouchableOpacity
                  disabled={duration >= 2}
                  onPress={() => setDuration(duration + 1)}
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
                      className="rounded-lg px-4 py-2 border justify-center"
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

        {/* COURT SELECTOR SECTION */}
        {isCourtSport && selectedStartHour !== null && courts.length > 0 && (
          <View className="px-4 mt-5">
            <Text className="text-[15px] font-bold text-white tracking-wide pb-3">
              Select Court
            </Text>

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {courts.map((court) => {
                const selected = selectedCourt === court.id;

                // Determine appropriate sports icon type based on plan context
                let sportIconName: keyof typeof MaterialIcons.glyphMap = "sports-tennis"; // Pickleball default
                if (planType === "badminton") {
                  sportIconName = "sports-cricket"; // Clean generic racket representation
                }

                return (
                  <TouchableOpacity
                    key={court.id}
                    onPress={() => setSelectedCourt(court.id)}
                    className="w-[48.5%]"
                  >
                    <View
                      className="rounded-xl p-4 border relative items-center justify-center min-h-[110px]"
                      style={{
                        backgroundColor: "#121212",
                        borderColor: selected ? "#ff5500" : "#1a1a1a",
                        borderWidth: selected ? 1.5 : 1,
                      }}
                    >
                      {selected && (
                        <View className="absolute top-2 right-2 bg-[#ff5500] rounded-full p-0.5">
                          <MaterialIcons name="check" size={12} color="#000" />
                        </View>
                      )}

                      {/* SPORT ICON DISPLAY */}
                      <View className="mb-2 w-8 h-8 rounded-full bg-neutral-900/60 items-center justify-center border border-neutral-800/80">
                        <MaterialIcons
                          name={sportIconName}
                          size={16}
                          color={selected ? "#ff5500" : "#737373"}
                        />
                      </View>

                      <Text className="text-center font-bold text-base text-white">
                        {court.name}
                      </Text>
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
              {isCourtSport && (
                <View className="w-1/2 mb-3">
                  <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Court</Text>
                  <Text className="text-[13px] font-bold text-white mt-0.5">
                    {courts.find((c) => c.id === selectedCourt)?.name || "Not Selected"}
                  </Text>
                </View>
              )}

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
                {formatHour(selectedStartHour)} - {formatHour(endHour!)}
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