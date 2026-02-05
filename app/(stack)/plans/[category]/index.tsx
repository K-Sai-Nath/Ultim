import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  const plans = plansMap[category ?? ""] ?? [];

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

      {/* CONTENT */}
      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {plans.map((plan: any) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            onPress={() => router.push(`/(stack)/plans/${category}/${plan.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENT                           */
/* ---------------------------------- */

function PlanRow({ plan, onPress }: any) {
  return (
    <View className="mb-5 rounded-xl bg-card-light dark:bg-card-dark p-4 border border-border-light dark:border-border-dark">
      {/* ROW */}
      <View className="flex-row items-stretch gap-4">
        {/* LEFT IMAGE — FULL HEIGHT */}
        <Image
          source={{ uri: plan.image }}
          className="rounded-lg"
          resizeMode="cover"
          style={{ width: "40%", height: "100%" }}
        />

        {/* RIGHT CONTENT — STRETCH */}
        <View className="flex-1 justify-between">
          <View>
            <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              {plan.title}
            </Text>

            <Text className="text-sm mt-1 text-text-secondary-light dark:text-text-secondary-dark">
              Credits: {plan.credits}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="
    self-start mt-3
    px-5 py-2
    rounded-full
    bg-primary
  "
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Text className="text-sm font-bold text-white tracking-wide">
              View Plan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
