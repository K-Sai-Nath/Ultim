import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* SPORT THEME CONFIG                  */
/* ---------------------------------- */
/* Each sport gets its own accent color, icon and a fallback hero image.
   If the API returns `plan.image`, that is used instead of the fallback. */

const SPORT_THEME: Record<
  string,
  { accent: string; icon: any; fallbackImage: any }
> = {
  gym: {
    accent: "#FF7A00",
    icon: "dumbbell",
    fallbackImage: require("../../../../assets/images/fitnessbg.png"),
  },
  fitness: {
    accent: "#FF7A00",
    icon: "dumbbell",
    fallbackImage: require("../../../../assets/images/fitnessbg.png"),
  },
  pickleball: {
    accent: "#FF5A36",
    icon: "weight-lifter",
    fallbackImage: require("../../../../assets/images/pickleballbg.png"),
  },
  badminton: {
    accent: "#FFC107",
    icon: "badminton",
    fallbackImage: require("../../../../assets/images/batmintonbg.png"),
  },
  swimming: {
    accent: "#11C5FF",
    icon: "swim",
    fallbackImage: require("../../../../assets/images/swimmingbg.png"),
  },
  football: {
    accent: "#45D61B",
    icon: "soccer",
    fallbackImage: require("../../../../assets/images/fitness.png"),
  },
  yoga: {
    accent: "#B98CFF",
    icon: "yoga",
    fallbackImage: require("../../../../assets/images/yoga.png"),
  },
  health: {
    accent: "#B98CFF",
    icon: "yoga",
    fallbackImage: require("../../../../assets/images/yoga.png"),
  },
  default: {
    accent: "#8B5CF6",
    icon: "star-circle",
    fallbackImage: require("../../../../assets/images/fitness.png"),
  },
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

  useEffect(() => {
    if (!category) return;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");
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
      {/* HEADER */}
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

      {!loading && error !== "" && (
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

      {!loading && !error && plans.length === 0 && (
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
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
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
/* MEMBERSHIP CARD                     */
/* ---------------------------------- */

function PlanRow({ plan, onPress }: any) {
  const membershipType = (plan.type ?? plan.sport ?? "gym")
    .toString()
    .toLowerCase();

  const theme = SPORT_THEME[membershipType] ?? SPORT_THEME.default;
  const accent = theme.accent;
  const icon = theme.icon;

  // Prefer the image coming from the API, fall back to a sport themed asset
  const heroImageSource: ImageSourcePropType =
    plan?.image && typeof plan.image === "string"
      ? { uri: plan.image }
      : theme.fallbackImage;
  const facility = plan?.tenant?.Facility ?? "Facility";

  const duration = `${plan.Duration} MONTH${
    Number(plan.Duration) > 1 ? "S" : ""
  }`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        width: "100%",
        aspectRatio: 3 / 2, // mobile-optimised: full width banner-style card
        marginBottom: 16,
        borderRadius: 26,
        overflow: "hidden",
        
        borderWidth: 1,
        borderColor: accent,

        shadowColor: accent,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
      }}
    >
      <ImageBackground
  source={heroImageSource} // Change to your image path
  resizeMode="cover"
  style={{ flex: 1 }}
>

    
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 18,
          }}
        >
          {/* TOP: badge + title + duration */}
          <View style={{ width: "58%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                borderWidth: 1.3,
                borderColor: accent,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                
              }}
            >
              <MaterialCommunityIcons name={icon} size={16} color={accent} />
              <Text
                style={{
                  marginLeft: 7,
                  color: accent,
                  fontWeight: "900",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontStyle: "italic",
                }}
              >
                {membershipType}
              </Text>
            </View>

            <Text
              numberOfLines={2}
              style={{
                   marginTop: 14,
    color: accent,
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 27,
    fontStyle: "italic",
    letterSpacing: 0.8,
    textTransform: "uppercase",
              }}
            >
              {facility}
            </Text>

            <Text
              style={{
                
                marginTop: 8,
                color: "white",
                fontWeight: "900",
                fontStyle: "italic",
fontSize: 17,
letterSpacing: 1,

              }}
            >
              {duration}
            </Text>

            <Text
              style={{
                marginTop: 2,
                color: "#A8A8A8",
                fontSize: 10,
                letterSpacing: 4,
                fontStyle: "italic",
              }}
            >
              MEMBERSHIP
            </Text>

            <View
              style={{
                marginTop: 12,
                width: 56,
                height: 4,
                borderRadius: 10,
                backgroundColor: accent,
              }}
            />
          </View>

          {/* BOTTOM: coins + price */}
          <View
            style={{
              width: "58%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
          

              <View style={{ marginLeft: 9 }}>
                <Text style={{ color: "#BDBDBD", fontSize: 10, letterSpacing: 1,fontStyle: "italic", }}>
                  EARN
                </Text>
                <Text
                  style={{
                    color: accent,
                    fontWeight: "900",
                    fontSize: 19,
                    lineHeight: 21,
                    fontStyle: "italic",
                  }}
                >
                  {plan.creditsOffered}
                </Text>
                <Text style={{ color: "#BDBDBD", fontSize: 10, letterSpacing: 1,fontStyle: "italic" }}>
                  CREDITS
                </Text>
              </View>
            </View>

            <View
              style={{
                width: 1,
                height: 50,
                backgroundColor: "#5F5F5F",
                marginHorizontal: 10,
              }}
            />

            <View>
              <Text style={{ color: "#BDBDBD", fontSize: 10, letterSpacing: 1,fontStyle: "italic", }}>
                PRICE
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  marginTop: 2,
                  color: accent,
                  fontWeight: "900",
                  fontSize: 24,
                  fontStyle: "italic",
                }}
              >
                ₹{plan.planPrice}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}