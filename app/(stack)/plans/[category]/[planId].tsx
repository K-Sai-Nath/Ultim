import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";

/* ---------------------------------- */
/* TYPES                               */
/* ---------------------------------- */

type Pricing = Record<string, string>;

type Plan = {
  title: string;
  images: string[];
  features: string[];
  pricing: Pricing;
};

type PlansByCategory = Record<string, Record<string, Plan>>;

/* ---------------------------------- */
/* MOCK PLAN DATA                      */
/* ---------------------------------- */

const PLAN_DETAILS: PlansByCategory = {
  fitness: {
    "1": {
      title: "Gym Monthly Plan",
      images: [
        "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
      ],
      features: [
        "4,000 Ultim Credits",
        "Guest access for your circle",
        "30 days credit validity",
      ],
      pricing: {
        Monthly: "₹2,999",
        Quarterly: "₹7,999",
        Yearly: "₹12,999",
      },
    },
  },

  sports: {
    "3": {
      title: "Badminton Plan",
      images: [
        "https://loremflickr.com/400/300/badminton",
        "https://loremflickr.com/400/300/sports",
      ],
      features: [
        "3,000 Ultim Credits",
        "Court access included",
        "30 days credit validity",
      ],
      pricing: {
        Monthly: "₹1,999",
        Quarterly: "₹5,499",
        Yearly: "₹9,999",
      },
    },
  },

  health: {
    "5": {
      title: "Yoga Plan",
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
      ],
      features: [
        "2,000 Ultim Credits",
        "Guided yoga sessions",
        "30 days credit validity",
      ],
      pricing: {
        Monthly: "₹1,499",
        Quarterly: "₹3,999",
        Yearly: "₹6,999",
      },
    },
  },
};

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

  const plan = PLAN_DETAILS?.[category]?.[planId];

  if (!plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
          Plan not found
        </Text>
      </SafeAreaView>
    );
  }

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
            data={plan.images}
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
          {/* TITLE + FEATURES CARD */}
          <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
            <Text className="text-2xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
              {plan.title}
            </Text>

            <View className="mt-4 gap-3">
              {plan.features.map((item, idx) => (
                <Feature key={idx} text={item} />
              ))}
            </View>
          </View>

          {/* PRICING CARD */}
          <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
            <Text className="text-lg font-bold mb-3 text-text-primary-light dark:text-text-primary-dark">
              Pricing
            </Text>

            {Object.entries(plan.pricing).map(([label, price]) => (
              <PriceRow key={label} label={label} price={price} />
            ))}
          </View>

          {/* INFO CARD */}
          <View className="rounded-xl border border-border-light dark:border-border-dark p-4">
            <View className="flex-row gap-3">
              <MaterialIcons name="location-on" size={22} color="#ff7b00" />
              <Text className="flex-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Reach your venue to avail credits. Credits activate on check-in.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
