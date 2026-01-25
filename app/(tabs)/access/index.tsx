import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK DATA (replace with backend)   */
/* ---------------------------------- */

const ACTIVITIES = [
  {
    id: "gym",
    title: "Gym & Fitness",
    image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
  },
  {
    id: "badminton",
    title: "Badminton Court",
    image: "https://loremflickr.com/400/400/badminton",
  },
  {
    id: "swimming",
    title: "Swimming Pool",
    image: "https://loremflickr.com/400/400/swimming",
  },
  {
    id: "yoga",
    title: "Yoga Studio",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function AccessScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000";

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
          Access
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="px-4"
      >
        <View className="gap-4 mt-2">
          {ACTIVITIES.map((item) => (
            <ActivityCard
              key={item.id}
              title={item.title}
              image={item.image}
              onPress={() => router.push(`/(stack)/activites/${item.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* ACTIVITY CARD                       */
/* ---------------------------------- */

function ActivityCard({
  title,
  image,
  onPress,
}: {
  title: string;
  image: string;
  onPress: () => void;
}) {
  return (
    <View
      className="
        flex-row items-center gap-4
        rounded-xl p-4
        bg-card-light dark:bg-card-dark
        border border-border-light dark:border-border-dark
      "
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      {/* Image — LEFT */}
      <View className="w-28 aspect-square rounded-lg overflow-hidden">
        <Image
          source={{ uri: image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/10" />
      </View>

      {/* Content — RIGHT */}
      <View className="flex-1 justify-center">
        <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>

        {/* Book Now Button */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          className="mt-2 px-4 py-2 bg-primary rounded-lg self-start"
        >
          <Text className="text-sm font-bold text-white">View Venues</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
