import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface Membership {
  id: number;
  endDate: string;
  availableCredits: number | null;
  membershipPlan: {
    id: number;
    planName: string;
    type: string;
  };
  tenant?: {
    Facility?: string;
  };
}
/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function AccessScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000";

  /* ---------------------------------- */
  /* FETCH MEMBERSHIPS                  */
  /* ---------------------------------- */

  const fetchMemberships = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.docs || [];
  };

  const {
    data: memberships = [],
    isLoading,
    isError,
  } = useQuery<Membership[]>({
    queryKey: ["memberships"],
    queryFn: fetchMemberships,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
  /* ---------------------------------- */
  /* FILTER ACTIVE MEMBERSHIPS          */
  /* ---------------------------------- */
  const activeMemberships = memberships.filter(
    (m: { endDate: string | number | Date }) => new Date(m.endDate) > new Date()
  );
  /* ---------------------------------- */
  /* IMAGE BASED ON TYPE                */
  /* ---------------------------------- */
  console.log(activeMemberships);
  const getImageForType = (type: string) => {
    switch (type) {
      case "badminton":
        return "https://loremflickr.com/400/400/badminton";
      case "gym":
        return "https://images.unsplash.com/photo-1558611848-73f7eb4001a1";
      case "swimming":
        return "https://loremflickr.com/400/400/swimming";
      case "yoga":
        return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b";
      default:
        return "https://images.unsplash.com/photo-1558611848-73f7eb4001a1";
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
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-4"
      >
        {isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
              Loading your access...
            </Text>
          </View>
        ) : activeMemberships.length === 0 ? (
          <View className="mt-20 items-center">
            <MaterialIcons name="event-busy" size={50} color="#999" />
            <Text className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark">
              No Active Memberships
            </Text>
            <Text className="mt-2 text-sm text-gray-400 text-center px-10">
              Purchase a membership to start booking activities.
            </Text>
          </View>
        ) : (
          <View className="gap-4 mt-2">
            {activeMemberships.map((item) => (
              <ActivityCard
                key={item.id}
                title={item.membershipPlan.planName}
                facility={item.tenant?.Facility || ""}
                image={getImageForType(item.membershipPlan.type)}
                expiryDate={item.endDate}
                credits={item.availableCredits}
                onPress={() => {
                  console.log("Item:", item);
                  console.log("Item Id:", item.id);
                  router.push(`/(stack)/memberships/book/${item.id}`);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* ACTIVITY CARD                       */
/* ---------------------------------- */

function ActivityCard({
  title,
  facility,
  image,
  expiryDate,
  credits,
  onPress,
}: {
  title: string;
  facility: string;
  image: string;
  expiryDate: string;
  credits: number | null;
  onPress: () => void;
}) {
  const formattedDate = new Date(expiryDate).toLocaleDateString();

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
      {/* Image */}
      <View className="w-28 aspect-square rounded-lg overflow-hidden">
        <Image
          source={{ uri: image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/10" />
      </View>

      {/* Content */}
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">{facility}</Text>

        <Text className="text-xs text-gray-400 mt-1">
          Expires on: {formattedDate}
        </Text>

        {credits !== null && (
          <Text className="text-xs text-gray-400 mt-1">Credits: {credits}</Text>
        )}

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          className="mt-3 px-4 py-2 bg-primary rounded-2xl self-start"
        >
          <Text className="text-sm font-semibold text-black dark:text-white">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
