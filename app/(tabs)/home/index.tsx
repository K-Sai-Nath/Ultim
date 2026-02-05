import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
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

const user = {
  name: "Alex",
  credits: 120,
  planCycle: "Monthly",
};

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
  const handleTryNewNavigation = (title: string) => {
    switch (title) {
      case "Swimming":
        router.push("/(stack)/activites/swimming/book/swimming");
        break;

      case "Yoga":
        router.push("/(stack)/activites/yoga/book/yoga");
        break;

      case "Badminton":
        router.push("/(stack)/activites/badminton/book/badminton");
        break;

      default:
        router.push("/(tabs)/access");
    }
  };
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
            Welcome back, {user.name}
          </Text>
          <Text className="text-xs font-bold tracking-wider text-primary">
            OneAll Arena
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
        {/* BANNER SLIDER */}
        <BannerSlider />

        {/* FITNESS CATEGORIES */}
        <View className="px-4 mt-8">
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
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
            <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
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
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">
            Today’s Booking
          </Text>

          <TodayBookingCard
            title="General Gym Session"
            location="Main Fitness Center, Floor 2"
            booked={todayBookings.gym.booked}
            image="https://images.unsplash.com/photo-1558611848-73f7eb4001a1"
            onGenerateQR={() => router.push("/(stack)/qr/1")}
            onViewQR={() => router.push("/(stack)/qr/1")}
          />

          {todayBookings.badminton.booked && (
            <TodayBookingCard
              title="Badminton Session"
              time={todayBookings.badminton.time}
              location="Court 2"
              booked
              image="https://loremflickr.com/400/400/badminton"
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
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-72 mr-5 mb-1 rounded-2xl bg-card-light dark:bg-card-dark overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
        elevation: 2,
      }}
    >
      {/* IMAGE SECTION */}
      <Image
        source={{ uri: image }}
        className="w-full h-36"
        resizeMode="cover"
      />

      {/* INFO SECTION */}
      <View className="p-2">
        {/* Title */}
        <Text className="text-base font-extrabold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>

        {/* Venue */}
        <Text className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
          {venue}
        </Text>

        {/* Location */}
        <View className="flex-row items-center gap-1 mt-1">
          <MaterialIcons name="location-on" size={14} color="#9ca3af" />
          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {location}
          </Text>
        </View>

        {/* CREDITS */}
        <View className="mt-1 self-start  py-1">
          <Text className="text-xs font-bold text-primary">
            {credits} Credits
          </Text>
        </View>

        {/* CTA */}
        <View className="mt-3 self-start px-3 py-1.5 rounded-full bg-primary/10">
          <Text className="text-xs font-bold text-primary">Explore →</Text>
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
  return (
    <View className="mb-6 rounded-2xl overflow-hidden  border border-border-light dark:border-border-dark">
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

          {!booked && (
            <TouchableOpacity
              onPress={onGenerateQR}
              className="mt-3 self-start px-5 py-2.5 rounded-xl bg-primary"
            >
              <Text className="text-xs font-bold text-white">Generate QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {booked && (
        <>
          <View className="h-px bg-border-light dark:bg-border-dark mx-5" />
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Confirmed
              </Text>
            </View>

            <TouchableOpacity
              onPress={onViewQR}
              className="px-4 py-2 rounded-xl bg-primary/10"
            >
              <Text className="text-xs font-bold text-primary">View QR →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
