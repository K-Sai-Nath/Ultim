import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK DATA (backend-like)            */
/* ---------------------------------- */

const ACTIVITY_SESSIONS: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    location: string;
    credits: number;
    image: string;
  }[]
> = {
  gym: [
    {
      id: "gym-1",
      title: "General Gym Access",
      description:
        "Full access to gym equipment including cardio, strength and free weights.",
      location: "Main Gym Floor",
      credits: 10,
      image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    },
    {
      id: "gym-2",
      title: "Strength Training Zone",
      description:
        "Dedicated strength training area with guided equipment and racks.",
      location: "Strength Zone",
      credits: 12,
      image: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74",
    },
  ],
  badminton: [
    {
      id: "bad-1",
      title: "Badminton Court Access",
      description:
        "Indoor badminton court with professional flooring and lighting.",
      location: "Court 1",
      credits: 8,
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07c",
    },
  ],
  swimming: [
    {
      id: "swim-1",
      title: "Swimming Pool Access",
      description:
        "Temperature-controlled indoor pool suitable for laps and leisure.",
      location: "Indoor Pool",
      credits: 10,
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266634",
    },
  ],
  yoga: [
    {
      id: "yoga-1",
      title: "Yoga Studio Access",
      description:
        "Peaceful yoga studio with mats, blocks and guided ambience.",
      location: "Yoga Studio",
      credits: 6,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    },
  ],
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function ActivitySessionsScreen() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000";
  const sessions = ACTIVITY_SESSIONS[activityId ?? ""] ?? [];

  const titleMap: Record<string, string> = {
    gym: "Gym & Fitness",
    badminton: "Badminton",
    swimming: "Swimming",
    yoga: "Yoga",
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          {titleMap[activityId ?? ""] ?? "Activity"}
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* List */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onBook={() =>
              router.push(`/(stack)/activites/${activityId}/book/${item.id}`)
            }
          />
        )}
        ListEmptyComponent={() => (
          <View className="mt-20 items-center">
            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
              No activities available
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* SESSION CARD                        */
/* ---------------------------------- */

function SessionCard({
  session,
  onBook,
}: {
  session: {
    title: string;
    description: string;
    location: string;
    credits: number;
    image: string;
  };
  onBook: () => void;
}) {
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
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: session.image }}
          className="w-full h-44"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/10" />

        {/* Credits badge */}
        <View className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-primary">
          <Text className="text-xs font-bold text-white">
            {session.credits} credits
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-lg font-extrabold text-text-primary-light dark:text-text-primary-dark">
          {session.title}
        </Text>

        <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {session.description}
        </Text>

        <View className="flex-row items-center gap-1 mt-2">
          <MaterialIcons name="location-on" size={14} color="#9ca3af" />
          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {session.location}
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={onBook}
          activeOpacity={0.9}
          className="mt-4 py-3 rounded-xl bg-primary items-center"
        >
          <Text className="text-sm font-bold text-white tracking-wide">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
