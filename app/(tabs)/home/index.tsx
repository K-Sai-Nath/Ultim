import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/authService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";
/* ---------------------------------- */
/* MOCK DATA                           */
/* ---------------------------------- */

const banners = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    title: "Inter-Club Badminton Championship",
    date: "12 Oct 2026",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    title: "Fitness Bootcamp",
    date: "18 Oct 2026",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    title: "Yoga & Wellness Retreat",
    date: "25 Oct 2026",
  },
];

const tryNewItems = [
  {
    id: "1",
    title: "Swimming",
    venue: "Aqua Sports Complex",
    location: "Block A • Pool Area",
    credits: 120,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
  },
  {
    id: "2",
    title: "Zumba",
    venue: "Dance Studio",
    location: "Fitness Floor • Hall 3",
    credits: 80,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a",
  },
  {
    id: "3",
    title: "CrossFit",
    venue: "Iron Box Arena",
    location: "Ground Floor • Zone C",
    credits: 150,
    image: "https://images.unsplash.com/photo-1517964603305-11c0f6f66012",
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const handleTryNewNavigation = (title: string) => {
    switch (title) {
      case "Swimming":
        Alert.alert("Swimming");
        break;

      case "Yoga":
        Alert.alert("Yoga");
        break;

      case "Badminton":
        Alert.alert("Badminton");
        break;

      default:
        router.push("/(tabs)/access");
    }
  };
  const fetchMemberships = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.docs || [];
  };

  const fetchTodayBookings = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const today = new Date().toISOString().split("T")[0];
    console.log(today);
    const res = await axios.get(
      `https://ultim-server.vercel.app/api/bookings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data || [];
  };
  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: fetchMemberships,
    staleTime: 1000 * 60 * 5,
  });

  const { data: todayBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["todayBookings"],
    queryFn: fetchTodayBookings,
    staleTime: 1000 * 60,
  });
  const today = new Date().toISOString().split("T")[0];

  const todayBookingsList = (todayBookings?.docs ?? []).filter((b: any) =>
    b.sessionDate.startsWith(today)
  );
  const gymMembership = memberships.find(
    (m: any) => m.membershipPlan.type === "gym"
  );
  console.log(todayBookings);
  const badmintonBooking = (todayBookingsList?.docs ?? []).find(
    (b: any) => b.membership?.membershipPlan?.type === "badminton"
  );
  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="ml-3">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome back, {user?.fullName}
          </Text>
          <Text className="text-xs font-bold tracking-wider text-primary">
            {user?.tenants?.[0]?.Facility}
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER SLIDER */}
        <BannerSlider />

        {/* FITNESS CATEGORIES */}
        <View className="px-4 mt-8">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
            Explore Categories
          </Text>

          <View className="flex-row gap-3">
            <FitnessCard
              title="Fitness"
              image="https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
              onPress={() => router.push("/(stack)/plans/fitness")}
            />

            <FitnessCard
              title="Sports"
              image="https://images.unsplash.com/photo-1517649763962-0c623066013b"
              onPress={() => router.push("/(stack)/plans/sports")}
            />

            <FitnessCard
              title="Health"
              image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
              onPress={() => router.push("/(stack)/plans/health")}
            />
          </View>
        </View>

        {/* TRY SOMETHING NEW */}
        <View className="mt-10">
          <View className="px-4 mb-3">
            <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark ml-1">
              Try Something New
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {tryNewItems.map((item) => (
              <TryNewCard
                key={item.id}
                title={item.title}
                venue={item.venue}
                location={item.location}
                credits={item.credits}
                image={item.image}
                onPress={() => {
                  handleTryNewNavigation(item.title);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* TODAY BOOKING */}
        <View className="px-4 mt-10 pb-8">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
            Today’s Booking
          </Text>

          {/* Gym Membership Card */}
          {gymMembership && (
            <TodayBookingCard
              title="General Gym Session"
              location={gymMembership.tenant?.Facility ?? "Gym Facility"}
              booked={true}
              image="https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
              onGenerateQR={() => router.push("/(stack)/qr/1")}
              onViewQR={() => router.push("/(stack)/qr/1")}
            />
          )}

          {/* Badminton Booking Card */}
          {badmintonBooking && (
            <TodayBookingCard
              title="Badminton Session"
              time={`${badmintonBooking} - ${badmintonBooking.endTime}`}
              location={badmintonBooking.venue ?? "Badminton Court"}
              booked
              image="https://loremflickr.com/400/400/badminton"
              onViewQR={() => router.push("/(stack)/qr/1")}
            />
          )}

          {/* No bookings */}
          {!gymMembership && !badmintonBooking && (
            <Text className="text-text-secondary-light dark:text-text-secondary-dark ml-1">
              No bookings for today
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function BannerSlider() {
  const { width } = Dimensions.get("window");
  return (
    <View className="mt-4">
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        showPagination
        paginationActiveColor="#ff7b00"
        paginationDefaultColor="#d1d5db"
        paginationStyle={{
          bottom: -5,
        }}
        paginationStyleItem={{
          width: 6,
          height: 6,
          marginHorizontal: 4,
        }}
        data={banners}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <View
              className="mx-4 rounded-2xl overflow-hidden"
              style={{ height: 176 }}
            >
              {/* IMAGE */}
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />

              {/* OVERLAY */}
              <View className="absolute inset-0 bg-black/35" />

              {/* TEXT */}
              <View className="absolute bottom-4 left-4 right-4">
                <Text className="text-white text-base font-extrabold">
                  {item.title}
                </Text>
                <Text className="text-white/80 text-xs mt-1">
                  📅 {item.date}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function FitnessCard({ title, image, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 h-36 rounded-2xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <Image
        source={{ uri: image }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/35" />
      <View className="flex-1 justify-end p-4">
        <Text className="text-white text-base font-extrabold">{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TryNewCard({ title, venue, location, image, credits, onPress }: any) {
  const { colorScheme } = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-72 mr-5 mb-1 rounded-3xl 
        bg-card-light dark:bg-card-dark 
        border border-border-light dark:border-border-dark 
        overflow-hidden"
    >
      {/* IMAGE SECTION */}
      <Image
        source={{ uri: image }}
        className="w-full h-40"
        resizeMode="cover"
      />

      {/* INFO SECTION */}
      <View className="p-4">
        {/* Title */}
        <Text
          className="text-lg font-semibold 
          text-text-primary-light dark:text-text-primary-dark"
        >
          {title}
        </Text>

        {/* Venue */}
        <Text
          className="text-sm mt-1 
          text-text-secondary-light dark:text-text-secondary-dark"
        >
          {venue}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
          <Text
            className="ml-1 text-xs 
            text-text-secondary-light dark:text-text-secondary-dark"
          >
            {location}
          </Text>
        </View>

        {/* Credits + CTA Row */}
        <View className="flex-row items-center justify-between mt-4">
          {/* Credits */}
          <Text className="text-sm font-semibold text-primary">
            {credits} <Text className="text-xs font-medium">Credits</Text>
          </Text>

          {/* Explore Button */}
          <View
            className="px-5 py-2 rounded-full 
    bg-card-light dark:bg-[#2c2b2b]
    border border-border-light dark:border-border-dark"
          >
            <View className="flex-row items-center gap-1">
              <Text
                className="text-sm font-medium
      text-text-secondary-light dark:text-text-primary-dark"
              >
                Explore
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={colorScheme === "dark" ? "#F5F5F5" : "#6B7280"}
              />
            </View>
          </View>
        </View>
      </View>
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
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="mb-6 rounded-3xl overflow-hidden 
      bg-card-light dark:bg-card-dark 
      border border-border-light dark:border-border-dark"
    >
      {/* Top Content */}
      <View className="flex-row p-5 gap-4">
        <Image
          source={{ uri: image }}
          className="w-20 h-20 rounded-2xl"
          resizeMode="cover"
        />

        <View className="flex-1 justify-center">
          {/* Time Badge */}
          {time && (
            <View className="self-start mb-2 px-3 py-1 rounded-full bg-primary">
              <Text className="text-[10px] font-semibold text-black uppercase">
                {time}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            className="text-lg font-semibold 
            text-text-primary-light dark:text-text-primary-dark"
          >
            {title}
          </Text>

          {/* Location */}
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="location-on" size={14} color="#9CA3AF" />
            <Text
              className="ml-1 text-xs 
              text-text-secondary-light dark:text-text-secondary-dark"
            >
              {location}
            </Text>
          </View>
        </View>
      </View>

      {/* Generate QR (Unbooked) */}
      {!booked && (
        <View className="px-5 pb-5">
          <TouchableOpacity
            onPress={onGenerateQR}
            className="w-full py-3 rounded-2xl bg-primary items-center"
          >
            <Text className="text-sm font-semibold text-black dark:text-white">
              Generate QR
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booked Section */}
      {booked && (
        <>
          <View
            className="h-px 
            bg-border-light dark:bg-border-dark 
            mx-5"
          />

          <View className="flex-row items-center justify-between px-5 py-4">
            {/* Confirmed */}
            <View className="flex-row items-center">
              <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
              <Text
                className="text-xs 
  text-text-secondary-light dark:text-text-secondary-dark 
  tracking-wide"
              >
                CONFIRMED
              </Text>
            </View>

            {/* View QR */}
            <TouchableOpacity
              onPress={onViewQR}
              className="px-5 py-2 rounded-full 
    bg-card-light dark:bg-[#2c2b2b]
    border border-border-light dark:border-border-dark"
            >
              <View className="flex-row items-center gap-1">
                <Text
                  className="text-sm font-medium
      text-text-secondary-light dark:text-text-primary-dark"
                >
                  View QR
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colorScheme === "dark" ? "#F5F5F5" : "#6B7280"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
