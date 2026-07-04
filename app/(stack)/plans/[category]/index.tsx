import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK PLANS                          */
/* ---------------------------------- */

const plansMap: any = {
  fitness: [
    {
      id: "1",
      title: "Gym Monthly Plan",
      credits: 100,
      image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    },
    {
      id: "2",
      title: "CrossFit Plan",
      credits: 150,
      image: "https://images.unsplash.com/photo-1517964603305-11c0f6f66012",
    },
  ],
  sports: [
    {
      id: "3",
      title: "Badminton Plan",
      credits: 80,
      image: "https://loremflickr.com/400/300/badminton",
    },
    {
      id: "4",
      title: "Swimming Plan",
      credits: 120,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
    },
  ],
  health: [
    {
      id: "5",
      title: "Yoga Plan",
      credits: 60,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    },
  ],
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function PlansScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#f5f5f5" : "#000";

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log(category, "category");
  useEffect(() => {
    if (!category) return;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
  "https://ultim-server.vercel.app/api/membership-plans",
  {
    params: {
      "where[category][equals]": category.trim(),
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }
);
        setPlans(res.data.docs);
        console.log(res.data.docs, "plans");
      } catch (err) {
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [category]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* HEADER — SAME AS ACCESS SCREEN */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {category?.toUpperCase()} Plans
        </Text>

        <View className="w-10 h-10" />
      </View>
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff7b00" />
          <Text className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Loading plans...
          </Text>
        </View>
      )}
      {error !== "" && (
        <View className="flex-1 justify-center items-center">
          <Text
            style={{
              color: isDark ? "#f87171" : "#dc2626",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            {error}
          </Text>
        </View>
      )}

      {/* CONTENT */}
      {!loading && !error && plans.length == 0 && (
        <View className="flex-1 justify-center items-center">
          <MaterialIcons
            name="event-busy"
            size={48}
            color={isDark ? "#9ca3af" : "#6b7280"}
          />
          <Text
            style={{
              color: isDark ? "#9ca3af" : "#6b7280",
              marginTop: 12,
              fontSize: 16,
            }}
          >
            No plans available
          </Text>
        </View>
      )}
      {!loading && !error && plans.length > 0 && (
        <ScrollView
          className="px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {plans.map((plan: any) => (
            <PlanRow
              key={plan.id}
              plan={plan}
              onPress={() =>
                router.push(`/(stack)/plans/${category}/${plan.id}`)
              }
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENT                           */
/* ---------------------------------- */

function PlanRow({ plan, onPress }: any) {
  const membershipType = (plan.type ?? plan.sport ?? "gym").toString().toLowerCase();
  const accentColors: Record<string, string> = {
    gym: "#ff7a00",
    badminton: "#f59e0b",
    swimming: "#06b6d4",
    football: "#16a34a",
    default: "#8b5cf6",
  };

  const backgroundImages: Record<string, string> = {
    gym: "https://images.unsplash.com/photo-1554284126-aa88f22d8b72?auto=format&fit=crop&w=1200&q=80",
    badminton: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=1200&q=80",
    swimming: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80",
    football: "https://images.unsplash.com/photo-1505842465776-3d0036fbe0fe?auto=format&fit=crop&w=1200&q=80",
    default: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
  };

  const accentColor = accentColors[membershipType] ?? accentColors.default;
  const backgroundImage = backgroundImages[membershipType] ?? backgroundImages.default;
  const facilityName = plan?.tenant?.Facility ?? "Facility Name";
  const planName = plan.planName ?? plan.title ?? "Membership Plan";
  const durationLabel = plan.Duration ? `${plan.Duration} Month${plan.Duration === 1 || plan.Duration === "1" ? "" : "s"}` : "TBD";
  const priceLabel = plan.planPrice ? `₹${plan.planPrice}` : "Price TBD";
  const creditsLabel = plan.creditsOffered ?? plan.credits ?? "--";

  return (
    <View
      className="mb-5 overflow-hidden rounded-3xl"
      style={{ aspectRatio: 3 / 2, backgroundColor: accentColor }}
    >
      <ImageBackground
        source={{ uri: backgroundImage }}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
        </View>
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 140,
            backgroundColor: "rgba(0,0,0,0.22)",
          }}
        />

        <View className="flex-1 p-5 justify-between">
          <View>
            <View
              className="flex-row items-center justify-between rounded-full px-3 py-1 mb-3 bg-white/15"
              style={{ alignSelf: "flex-start" }}
            >
              <Text className="text-xs font-bold uppercase tracking-wide text-white">
                {membershipType}
              </Text>
              <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                {durationLabel}
              </Text>
            </View>

            <Text className="text-3xl font-extrabold text-white leading-tight">
              {facilityName}
            </Text>

            <Text className="mt-3 text-lg font-semibold text-white/90">
              {planName}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-4">
            <View>
              <Text className="text-xs uppercase text-white/60">Price</Text>
              <Text className="text-2xl font-bold text-white mt-1">{priceLabel}</Text>
            </View>

            <View className="items-end">
              <Text className="text-xs uppercase text-white/60">Credits</Text>
              <Text className="text-lg font-semibold text-white mt-1">{creditsLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="self-start rounded-full px-5 py-3 mt-4"
            style={{
              backgroundColor: accentColor,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text className="text-sm font-bold text-white tracking-wide">
              View Plan
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
