import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.65;
const CARD_GAP = 14;

/* ---------------------------------- */
/* SPORT THEME                          */
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

function getSportTheme(type: string) {
  return ACCESS_THEME[type] ?? ACCESS_THEME.default;
}

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
/* BOOKING TIME HELPERS                */
/* ---------------------------------- */

// Given a booking, returns { start, end } Date objects for the session,
// combining sessionDate (calendar day) + sessionTime (HH:mm) + duration (hours).
function getSessionWindow(booking: any): { start: Date; end: Date } {
  const date = new Date(booking.sessionDate);
  const startHour = parseInt(booking.sessionTime?.split(":")[0] ?? "0", 10);
  const startMinute = parseInt(booking.sessionTime?.split(":")[1] ?? "0", 10);

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(start);
  end.setHours(start.getHours() + (booking.duration || 1));

  return { start, end };
}

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  const fetchMemberships = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return res.data.docs || [];
  };

  const fetchTodayBookings = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/bookings",
      { headers: { Authorization: `Bearer ${token}` } },
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
    // Keep the "did this just end" check reasonably fresh
    refetchInterval: 1000 * 60,
  });

  const today = new Date().toISOString().split("T")[0];

  // Show bookings that are today AND haven't ended more than 1 hour ago.
  const sortedTodayBookings = useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const list = (todayBookings?.docs ?? []).filter((b: any) => {
      if (!b.sessionDate?.startsWith(today)) return false;

      const { end } = getSessionWindow(b);
      return end.getTime() > oneHourAgo.getTime();
    });

    return list.sort((a: any, b: any) => {
      const aTime = a.sessionTime ?? "00:00";
      const bTime = b.sessionTime ?? "00:00";
      return aTime.localeCompare(bTime);
    });
  }, [todayBookings, today]);

  const activeMemberships = memberships.filter(
    (m: any) => new Date(m.endDate) > new Date(),
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
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(stack)/notifications")}
            className="w-10 h-10 rounded-full items-center justify-center bg-black/30 border border-white/25"
          >
            <MaterialIcons name="notifications" size={20} color="#fff" />
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
            <SportingEventCard key={event.id} event={event} onPress={() => {}} />
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
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
                <ImageBackground
                  source={plan.image}
                  style={{ height: 160, justifyContent: "flex-end" }}
                  imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
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
                  <View style={{ alignItems: "center", paddingBottom: 18 }}>
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
                        fontSize: plan.title === "ULTIM CIRCLE" ? 30 : 42,
                      }}
                    >
                      {plan.title.replace("ULTIM ", "")}
                    </Text>
                  </View>
                </ImageBackground>

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
                    style={{ fontSize: 38, fontWeight: "900" }}
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
                    <PlanBullet text={`${plan.credits} Ultim Credits`} />
                    <PlanBullet text="Guest access for your circle with the credits" />
                    <PlanBullet text={`${plan.validity} Credit Validity`} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* TODAY'S SPORT BOOKINGS */}
        <View className="mt-10">
          <View className="px-4 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                Today's Sport Bookings
              </Text>
              <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Scan at the venue to check-in
              </Text>
            </View>
          </View>

          {bookingsLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="small" color="#FF9500" />
              <Text className="mt-3 text-text-secondary-light dark:text-text-secondary-dark">
                Checking today's bookings...
              </Text>
            </View>
          ) : sortedTodayBookings.length > 0 ? (
            <FlatList
              data={sortedTodayBookings}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item, index }) => (
                <TodayBookingCard booking={item} isNext={index === 0} />
              )}
            />
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
    <View className="px-4 mt-5 mb-3">
      <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark ml-1">
        {title}
      </Text>
    </View>
  );
}

function PlanBullet({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
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
      <Text className="flex-1 text-text-secondary-light dark:text-text-secondary-dark">
        {text}
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
                <Text className="text-white/90 text-sm mt-2">{item.subtitle}</Text>
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

function FitnessCard({ image, onPress }: any) {
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
      <Image source={image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
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
      <Image source={{ uri: court.image }} className="w-full h-48" resizeMode="cover" />
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
      <Image source={{ uri: event.image }} className="w-full h-48" resizeMode="cover" />
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

function InfoRow({ icon, primary, secondary, accent }: any) {
  return (
    <View className="flex-row items-start">
      <MaterialIcons name={icon} size={18} color={accent} style={{ marginTop: 2 }} />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          {primary}
        </Text>
        {secondary ? (
          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {secondary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ---------------------------------- */
/* TODAY'S BOOKING CARD (LIVE QR)      */
/* ---------------------------------- */

function TodayBookingCard({ booking, isNext }: { booking: any; isNext: boolean }) {
  const [qrToken, setQrToken] = useState<string | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let active = true;

    const generateQR = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const res = await axios.post(
          `https://ultim-server.vercel.app/api/bookings/${booking.id}/generate-qr`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (active) setQrToken(res.data.token);
      } catch (err) {
        console.log("QR refresh error:", err);
      }

      timeout = setTimeout(generateQR, 15000);
    };

    generateQR();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [booking.id]);

  const type = booking.membership?.membershipPlan?.type ?? "default";
  const theme = getSportTheme(type);
  const title = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Session";
  const courtName = booking.court ?? "Court";
  const facility = booking.tenant?.Facility ?? "Venue";
  const city = booking.tenant?.city ?? "";

  const { timeRange, dateLabel } = useMemo(() => {
    const { start, end } = getSessionWindow(booking);

    const dateLabel = start.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formatTime = (d: Date) =>
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

    return {
      timeRange: `${formatTime(start)} - ${formatTime(end)}`,
      dateLabel,
    };
  }, [booking]);

  return (
    <View
      className="rounded-3xl overflow-hidden bg-card-light dark:bg-card-dark"
      style={{
        width: CARD_WIDTH,
        marginRight: CARD_GAP,
        borderWidth: 1.5,
        borderColor: theme.accent,
      }}
    >
      {isNext && (
        <View className="items-center pt-4">
          <View
            style={{ backgroundColor: `${theme.accent}26` }}
            className="px-4 py-1 rounded-full"
          >
            <Text
              style={{ color: theme.accent }}
              className="text-xs font-bold tracking-wider"
            >
              UP NEXT
            </Text>
          </View>
        </View>
      )}

      <View className={`flex-row items-center px-5 ${isNext ? "pt-3" : "pt-5"}`}>
        <View
          style={{ backgroundColor: `${theme.accent}1A` }}
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
        >
          <MaterialIcons name={theme.icon as any} size={22} color={theme.accent} />
        </View>
        <View>
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            {title}
          </Text>
          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {courtName}
          </Text>
        </View>
      </View>

      <View className="px-5 py-5">
  <View className="p-3 rounded-2xl bg-white self-start">
    {qrToken ? (
      <QRCode
        value={qrToken}
        size={190}
        color="#000000"
        backgroundColor="#FFFFFF"
        ecl="H"
        quietZone={2}
      />
    ) : (
      <View
        style={{ width: 190, height: 190 }}
        className="items-center justify-center"
      >
        <ActivityIndicator size="small" color={theme.accent} />
      </View>
    )}
  </View>
</View>

      <View className="px-5 pb-6" style={{ gap: 14 }}>
        <InfoRow
          icon="access-time"
          primary={timeRange}
          secondary={dateLabel}
          accent={theme.accent}
        />
        <InfoRow
          icon="location-on"
          primary={facility}
          secondary={city}
          accent={theme.accent}
        />
        <InfoRow
          icon="grid-view"
          primary={courtName}
          secondary="Court"
          accent={theme.accent}
        />
      </View>
    </View>
  );
}