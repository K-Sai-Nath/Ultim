import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/authService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

/* ---------------------------------- */
/* STATIC DATA                         */
/* ---------------------------------- */

const banners = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
    title: "PLAY. SWEAT. WIN.",
    subtitle: "Book your favourite court today",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    title: "SPORTS FOR EVERYONE",
    subtitle: "Find courts near you",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=1200&q=80",
    title: "MOVE. PLAY. REPEAT.",
    subtitle: "Discover new activities",
  },
];

const courts = [
  {
    id: "court-1",
    name: "Sree Rama Badminton Academy",
    location: "Banganapalli, Bengaluru",
    distance: "4.6 km",
    price: "₹260 onwards",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "court-2",
    name: "Rush Arena - Cooke Town",
    location: "Maruthi Sevanagar, Bengaluru",
    distance: "1.9 km",
    price: "₹500 onwards",
    image:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "court-3",
    name: "The Rhythm Arena",
    location: "Kalyan Nagar, Bengaluru",
    distance: "4.7 km",
    price: "₹400 onwards",
    image:
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=900&q=80",
  },
];

const sportingEvents = [
  {
    id: "event-1",
    title: "Royal Pickleball League Bengaluru",
    venue: "Hive Club, Bengaluru",
    date: "Sat, 18 Jul - Sun, 19 Jul",
    image:
      "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "event-2",
    title: "Hyrox Simulation",
    venue: "The Fit Ground, Bengaluru",
    date: "Every Sat, 4:00 PM to 6:00 PM",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "event-3",
    title: "Sunset Football League",
    venue: "Play Arena, Bengaluru",
    date: "Sat, 20 Jul - Sun, 21 Jul",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const getImageForType = (type: string) => {
    switch (type) {
      case "badminton":
        return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80";
      case "gym":
        return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80";
      case "swimming":
        return "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80";
      case "yoga":
        return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80";
      default:
        return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80";
    }
  };

  const fetchMemberships = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return res.data.docs || [];
  };

  const fetchTodayBookings = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/bookings",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
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
    b.sessionDate?.startsWith(today),
  );

  const gymMembership = memberships.find(
    (m: any) => m.membershipPlan?.type === "gym",
  );

  const activeMemberships = memberships.filter(
    (m: any) => new Date(m.endDate) > new Date(),
  );

  const badmintonBooking = todayBookingsList.find(
    (b: any) => b.membership?.membershipPlan?.type === "badminton",
  );

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="absolute inset-x-0 z-10 flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 2 }}
        >
          <View className="ml-3">
          <Text className="text-lg font-bold text-white">
            Welcome back, {user?.fullName}
          </Text>

          <Text className="text-xs font-bold tracking-wider text-white/90">
            {user?.tenants?.[0]?.Facility}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(stack)/notifications")}
          className="w-10 h-10 rounded-full items-center justify-center bg-black/30 border border-white/25"
        >
          <MaterialIcons
            name="notifications"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      <BannerSlider />

      <SectionTitle title="Explore Categories" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 16,
            paddingBottom: 4,
          }}
        >
          <FitnessCard
            image={require("../../../assets/images/fitness.png")}
            onPress={() => router.push("/(stack)/plans/fitness")}
          />

          <FitnessCard
            image={require("../../../assets/images/sports.png")}
            onPress={() => router.push("/(stack)/plans/sports")}
          />

          <FitnessCard
            image={require("../../../assets/images/health.png")}
            onPress={() => router.push("/(stack)/plans/health")}
          />
        </ScrollView>

        {/* COURTS */}
        <SectionTitle title="Courts Near You" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onPress={() => router.push("/(stack)/plans/sports")}
            />
          ))}
        </ScrollView>

        {/* SPORTING EVENTS */}
        <SectionTitle title="Sporting Events Near You" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {sportingEvents.map((event) => (
            <SportingEventCard
              key={event.id}
              event={event}
              onPress={() => {}}
            />
          ))}
        </ScrollView>

{/* MEMBERSHIP PLANS */}
<View className="mt-10">
  <View className="px-4 mb-5">
    <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
      Membership Plans
    </Text>

    <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
      Choose a plan that fits your fitness journey.
    </Text>
  </View>
  
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: 16,
      paddingBottom: 8,
    }}
  >
    {[
      {
        title: "ULTIM 30",
        image: require("../../../assets/images/Plan30.avif"),
        oldPrice: "₹9,000",
        price: "₹2,999",
        credits: "4,000",
        validity: "30 Days",
      },
      {
        title: "ULTIM 90",
        image: require("../../../assets/images/Plan90.avif"),
        oldPrice: "₹27,000",
        price: "₹7,999",
        credits: "10,000",
        validity: "90 Days",
      },
      {
        title: "ULTIM 180",
        image: require("../../../assets/images/Plan180.avif"),
        oldPrice: "₹54,000",
        price: "₹12,999",
        credits: "18,000",
        validity: "180 Days",
      },
      {
        title: "ULTIM CIRCLE",
        image: require("../../../assets/images/PlanCircle.avif"),
        oldPrice: "₹1,08,000",
        price: "₹17,999",
        credits: "36,500",
        validity: "365 Days",
      },
    ].map((plan) => (
      <View
        key={plan.title}
        className="mr-4 rounded-3xl overflow-hidden bg-surface-light dark:bg-surface-dark"
        style={{
          width: 260,
          borderWidth: 1,
          borderColor: "rgba(255,122,0,0.22)",
        }}
      >
        {/* IMAGE HEADER */}
        <ImageBackground
          source={plan.image}
          style={{
            height: 160,
            justifyContent: "flex-end",
          }}
          imageStyle={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
         <View
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  }}
/>

          <View
            style={{
              alignItems: "center",
              paddingBottom: 18,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              ULTIM
            </Text>

            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize:
                  plan.title === "ULTIM CIRCLE" ? 30 : 42,
              }}
            >
              {plan.title.replace("ULTIM ", "")}
            </Text>
          </View>
        </ImageBackground>

        {/* CONTENT */}
        <View className="p-5">
          <Text
            style={{
              color: "#9CA3AF",
              textDecorationLine: "line-through",
              fontSize: 16,
            }}
          >
            {plan.oldPrice}
          </Text>

          <Text
            className="text-text-primary-light dark:text-text-primary-dark"
            style={{
              fontSize: 38,
              fontWeight: "900",
            }}
          >
            {plan.price}
          </Text>

          <Text
            style={{
              color: "#FF7A00",
              fontSize: 16,
              fontWeight: "700",
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            {plan.credits} Credits
          </Text>

          <View style={{ gap: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#FF7A00",
                  marginTop: 6,
                  marginRight: 10,
                }}
              />

              <Text
                className="flex-1 text-text-secondary-light dark:text-text-secondary-dark"
              >
                {plan.credits} Ultim Credits
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#FF7A00",
                  marginTop: 6,
                  marginRight: 10,
                }}
              />

              <Text
                className="flex-1 text-text-secondary-light dark:text-text-secondary-dark"
              >
                Guest access for your circle with the credits
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#FF7A00",
                  marginTop: 6,
                  marginRight: 10,
                }}
              />

              <Text
                className="flex-1 text-text-secondary-light dark:text-text-secondary-dark"
              >
                {plan.validity} Credit Validity
              </Text>
            </View>
          </View>
        </View>
      </View>
    ))}
  </ScrollView>
</View>
        {/* TODAY BOOKING */}
        <View className="px-4 mt-10">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3 ml-1">
            Today’s Booking
          </Text>

          {bookingsLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="small" color="#FF9500" />
              <Text className="mt-3 text-text-secondary-light dark:text-text-secondary-dark">
                Checking today’s bookings...
              </Text>
            </View>
          ) : gymMembership || badmintonBooking ? (
            <>
              {gymMembership && (
                <TodayBookingWithQRCard
                  title="General Gym Session"
                  location={gymMembership.tenant?.Facility ?? "Gym Facility"}
                />
              )}

              {badmintonBooking && (
                <TodayBookingWithQRCard
                  title="Badminton Session"
                  location={badmintonBooking.venue ?? "Badminton Court"}
                />
              )}
            </>
          ) : (
            <View className="py-10 items-center">
              <MaterialIcons
                name="event-busy"
                size={40}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="mt-3 text-text-secondary-light dark:text-text-secondary-dark">
                No bookings for today
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="px-4 mt-10 mb-3">
      <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark ml-1">
        {title}
      </Text>
    </View>
  );
}

function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={{ height: 320 }}>
      <SwiperFlatList
        autoplay
        autoplayDelay={2}
        autoplayLoop
        showPagination={false}
        onChangeIndex={({ index }) => setActiveIndex(index)}
        data={banners}
        renderItem={({ item }) => (
          <View style={{ width, height: 300 }}>
            <View className="overflow-hidden rounded-b-3xl" style={{ height: 300 }}>
              <Image
                source={{ uri: item.image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />

              <View className="absolute inset-0 bg-black/45" />

              <View className="absolute left-5 bottom-6 right-5">
                <Text className="text-white text-3xl font-extrabold">
                  {item.title}
                </Text>

                <Text className="text-white/90 text-sm mt-2">
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <View className="mt-2 flex-row justify-center items-center gap-2">
        {banners.map((_, index) => (
          <View
            key={index}
            className={
              index === activeIndex
                ? "h-2 rounded-full bg-primary"
                : "h-2 rounded-full bg-white/30"
            }
            style={{ width: index === activeIndex ? 24 : 10 }}
          />
        ))}
      </View>
    </View>
  );
}

function FitnessCard({ title, image, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="flex-1 rounded-2xl overflow-hidden"
      style={{
        height: 240,
        borderWidth: 1,
        aspectRatio: 1024 / 1536,
        borderColor: "rgba(255,122,0,0.18)",
      }}
    >
      <Image
        source={image}
        style={{
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

function CourtCard({ court, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-72 mr-4 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark"
    >
      <Image
        source={{ uri: court.image }}
        className="w-full h-48"
        resizeMode="cover"
      />

      <View className="p-4">
        <Text
          numberOfLines={2}
          className="text-base font-bold text-text-primary-light dark:text-text-primary-dark"
        >
          {court.name}
        </Text>

        <View className="flex-row items-center mt-3">
          <MaterialIcons name="location-on" size={14} color="#FF9500" />
          <Text
            numberOfLines={1}
            className="ml-1 text-xs text-text-secondary-light dark:text-text-secondary-dark"
          >
            {court.distance} • {court.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SportingEventCard({ event, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-72 mr-4 rounded-xl overflow-hidden border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
    >
      <Image
        source={{ uri: event.image }}
        className="w-full h-48"
        resizeMode="cover"
      />

      <View className="p-4">
        <Text
          numberOfLines={2}
          className="text-base font-bold text-text-primary-light dark:text-text-primary-dark"
        >
          {event.title}
        </Text>

        <View className="flex-row items-center mt-2">
          <MaterialIcons name="location-on" size={14} color="#FF9500" />
          <Text
            numberOfLines={1}
            className="ml-1 text-xs text-text-secondary-light dark:text-text-secondary-dark"
          >
            {event.venue}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark"
        >
          {event.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TryNewCard({ title, venue, location, image, credits, onPress }: any) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-72 mr-5 mb-1 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark overflow-hidden"
    >
      <Image
        source={{ uri: image }}
        className="w-full h-40"
        resizeMode="cover"
      />

      <View className="p-4">
        <Text className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>

        <Text className="text-sm mt-1 text-text-secondary-light dark:text-text-secondary-dark">
          {venue}
        </Text>

        <View className="flex-row items-center mt-1">
          <MaterialIcons
            name="location-on"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text className="ml-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {location}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-sm font-semibold text-primary">
            {credits} <Text className="text-xs font-medium">Credits</Text>
          </Text>

          <View className="px-5 py-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Explore
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={isDark ? "#F5F5F5" : "#111827"}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TodayBookingWithQRCard({
  title,
  location,
}: {
  title: string;
  location: string;
}) {
  return (
    <View className="mb-6 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
      {/* QR */}
      <View className="items-center pt-7 pb-5">
        <View className="p-3 rounded-xl bg-white">
          <Image
            source={{
              uri: "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=ultim-booking-checkin",
            }}
            className="w-48 h-48"
            resizeMode="contain"
          />
        </View>

        <Text className="mt-4 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          Scan this QR code at the venue
        </Text>
      </View>

      <View className="h-px bg-border-light dark:bg-border-dark mx-5" />

      {/* BOOKING DETAILS */}
      <View className="items-center px-5 pt-5 pb-6">
        <Text className="text-xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>

        <View className="flex-row items-center justify-center mt-2">
          <MaterialIcons name="location-on" size={16} color="#FF9500" />

          <Text className="ml-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {location}
          </Text>
        </View>

        <View className="flex-row items-center mt-4 px-3 py-2 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />

          <Text className="text-xs font-semibold tracking-wide text-text-primary-light dark:text-text-primary-dark">
            BOOKING CONFIRMED
          </Text>
        </View>
      </View>
    </View>
  );
}
