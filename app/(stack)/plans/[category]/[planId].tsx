import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";

/* ---------------------------------- */
/* TYPES                               */
/* ---------------------------------- */

type Plan = {
  MembershipPlanMaximumDiscount: any;
  id: number;
  planName: string;
  description: string;
  category: string;
  planPrice: number;
  Duration: string;
  creditsOffered: number;
  numberOfCreditsPerSession: number;
  numberOfSessions: number;
};

/* ---------------------------------- */
/* MOCK PLAN DATA                      */
/* ---------------------------------- */

const mockImages = [
  "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
  "https://images.unsplash.com/photo-1517964603305-11c0f6f66012",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc",
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function PlanDetailScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { category, planId } = useLocalSearchParams<{
    category: string;
    planId: string;
  }>();
  const [plan, setPlan] = useState<Plan | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!category) return;

    const fetchPlans = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `https://ultim-server.vercel.app/api/membership-plans?where[id][equals]=${planId}`
        );
        setPlan(res.data.docs?.[0] || null);
      } catch (err) {
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [planId]);

  const iconColor = isDark ? "#f5f5f5" : "#000";

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
      }}
    >
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Plan Details
        </Text>

        <View className="w-10 h-10" />
      </View>
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#a78bfa" : "#6366F1"}
          />
          <Text className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Loading plan details...
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

      {!loading && !error && !plan && (
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
            Plan not available
          </Text>
        </View>
      )}
      {!loading && !error && plan && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* IMAGE SLIDER (NOT FULL WIDTH) */}
          <View className="mt-2">
            <SwiperFlatList
              autoplay
              autoplayDelay={3}
              autoplayLoop
              showPagination
              paginationActiveColor="#ff7b00"
              paginationDefaultColor="#d1d5db"
              paginationStyle={{
                bottom: 6,
              }}
              paginationStyleItem={{
                width: 8,
                height: 8,
                marginHorizontal: 3,
                borderRadius: 4,
              }}
              data={mockImages}
              renderItem={({ item }) => (
                <View className="mx-4 rounded-2xl overflow-hidden">
                  <Image
                    source={{ uri: item }}
                    className="w-[90vw] h-56"
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          </View>
          <View className="px-4 mt-6 gap-4">
            {/* TITLE + FEATURES STYLE CARD */}
            <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
              <Text className="text-2xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
                {plan.planName}
              </Text>

              <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {plan.description}
              </Text>
            </View>
            {/* Details */}
            <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
              <Text className="text-lg font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">
                Details
              </Text>

              <View className="gap-3">
                <Feature text={`${plan.Duration} Month Duration`} />
                <Feature text={`${plan.numberOfSessions} Sessions Included`} />
                <Feature
                  text={`${plan.numberOfCreditsPerSession} Credits / Session`}
                />
                <Feature text={`${plan.creditsOffered} Total Credits`} />

                {plan.MembershipPlanMaximumDiscount > 0 && (
                  <Feature
                    text={`Max Discount ₹${plan.MembershipPlanMaximumDiscount}`}
                  />
                )}
              </View>
            </View>

            {/* PRICING CARD (Same Style As Before) */}
            <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
              <Text className="text-lg font-bold mb-3 text-text-primary-light dark:text-text-primary-dark">
                Pricing
              </Text>

              <PriceRow label="Plan Price" price={`₹${plan.planPrice}`} />
              <PriceRow label="Duration" price={`${plan.Duration} Month`} />
            </View>

            {/* INFO CARD */}
            <View className="rounded-xl border border-border-light dark:border-border-dark p-4 mb-20">
              <View className="flex-row gap-3">
                <MaterialIcons name="location-on" size={22} color="#ff7b00" />
                <Text className="flex-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Reach your venue to avail credits. Credits activate on
                  check-in.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* SMALL COMPONENTS                    */
/* ---------------------------------- */

function Feature({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
        <MaterialIcons name="check" size={16} color="#fff" />
      </View>
      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {text}
      </Text>
    </View>
  );
}

function PriceRow({ label, price }: { label: string; price: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-border-light dark:border-border-dark">
      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
        {price}
      </Text>
    </View>
  );
}
