import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface Membership {
  startDate: any;
  id: number;
  endDate: string;
  availableCredits: number | null;
  membershipPlan: {
    creditsOffered: any;
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
const [refreshing, setRefreshing] = useState(false);
  const iconColor = isDark ? "#f5f5f5" : "#000";

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  /* ---------------------------------- */
  /* FETCH MEMBERSHIPS                  */
  /* ---------------------------------- */
const onRefresh = async () => {
  setRefreshing(true);

  try {
    const data = await fetchMemberships();
    setMemberships(data);
  } catch (error) {
    console.error(error);
  } finally {
    setRefreshing(false);
  }
};
  const fetchMemberships = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data.docs || [];
  };

  useEffect(() => {
    let mounted = true;

    const loadMemberships = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await fetchMemberships();
        if (mounted) {
          setMemberships(data);
        }
      } catch (error) {
        console.error("Failed to fetch memberships", error);
        if (mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMemberships();

    return () => {
      mounted = false;
    };
  }, []);
  /* ---------------------------------- */
  /* FILTER ACTIVE MEMBERSHIPS          */
  /* ---------------------------------- */
  const activeMemberships = memberships.filter(
    (m: { endDate: string | number | Date }) =>
      new Date(m.endDate) > new Date(),
  );
  /* ---------------------------------- */
  /* IMAGE + BORDER ACCENT BY TYPE      */
  /* ---------------------------------- */
  const ACCESS_THEME: Record<
    string,
    { accent: string; fallbackImage: ImageSourcePropType }
  > = {
    badminton: {
      accent: "#FFC107",
      fallbackImage: require("../../../assets/images/batmintonbg.png"),
    },
    gym: {
      accent: "#FF7A00",
      fallbackImage: require("../../../assets/images/fitnessbg.png"),
    },
    swimming: {
      accent: "#11C5FF",
      fallbackImage: require("../../../assets/images/swimmingbg.png"),
    },
    yoga: {
      accent: "#B98CFF",
      fallbackImage: require("../../../assets/images/yoga.png"),
    },
    pickleball: {
      accent: "#FF5A36",
      fallbackImage: require("../../../assets/images/pickleballbg.png"),
    },
    football: {
      accent: "#45D61B",
      fallbackImage: require("../../../assets/images/fitnessbg.png"),
    },
    health: {
      accent: "#B98CFF",
      fallbackImage: require("../../../assets/images/yoga.png"),
    },
    default: {
      accent: "#8B5CF6",
      fallbackImage: require("../../../assets/images/fitnessbg.png"),
    },
  };

  const getTypeTheme = (type: string) => {
    const key = type.toLowerCase();
    return ACCESS_THEME[key] ?? ACCESS_THEME.default;
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
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#FF9500"
      colors={["#FF9500"]}
    />
  }
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 100 }}
  className="px-4"
>
  {isLoading ? (
    <View className="mt-20 items-center">
      <ActivityIndicator size="large" color="#FF9500" />

      <Text className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
        Loading your access...
      </Text>
    </View>
  ) : activeMemberships.length === 0 ? (
    <View className="mt-20 items-center">
      <MaterialIcons name="event-busy" size={50} color="#999" />

      <Text className="mt-4 text-lg text-text-secondary-light dark:text-text-primary-dark">
        No Active Memberships
      </Text>

      <Text className="mt-2 text-sm text-gray-400 text-center px-10">
        Purchase a membership to start booking activities.
      </Text>
    </View>
  ) : (
    <View style={{ gap: 16 }}>
      {activeMemberships.map((item) => {
        const theme = getTypeTheme(item.membershipPlan.type);

        return (
          <ActivityCard
            key={item.id}
            title={item.membershipPlan.planName}
            facility={item.tenant?.Facility || ""}
            image={theme.fallbackImage}
            accent={theme.accent}
            type={item.membershipPlan.type}
            startDate={item.startDate}
            expiryDate={item.endDate}
  credits={item.availableCredits}
  totalCredits={item.membershipPlan.creditsOffered}
            onPress={() => {
              console.log("Item:", item);
              console.log("Item Id:", item.id);

              router.push(`/(stack)/memberships/book/${item.id}`);
            }}
          />
        );
      })}
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
  type,
  image,
  accent,
  startDate,
  expiryDate,
  credits,
  totalCredits,
  onPress,
}: {
  title: string;
  facility: string;
  type: string;
  image: ImageSourcePropType;
  accent: string;
  startDate: string;
  expiryDate: string;
  credits: number | null;
  totalCredits: number;
  onPress: () => void;
}) {
  const formattedStartDate = new Date(startDate).toLocaleDateString();

const formattedEndDate = new Date(expiryDate).toLocaleDateString();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        width: "100%",
        height: 280,
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#090909",
        marginRight: 18,
        borderWidth: 1,
        borderColor: accent,
        shadowColor: accent,
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
      }}
    >
      <Image
        source={image}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      />

    

      {/* Gradient effect */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "55%",
      
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          padding: 22,
        }}
      >
        {/* TOP */}
<View>
  {/* Status + Sport */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
          justifyContent: "space-between",
    }}
  >
    {/* Active */}
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        backgroundColor: accent,
      }}
    >
      <Text
        style={{
          color: "#000",
          fontWeight: "900",
          fontSize: 12,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontStyle: "italic",
        }}
      >
        ACTIVE
      </Text>
    </View>

    {/* Sport */}
    <View
      style={{
        marginLeft: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: accent,
        backgroundColor: "rgba(0,0,0,.35)",
      }}
    >
      <Text
        style={{
          color: accent,
          fontWeight: "900",
          fontSize: 12,
          letterSpacing: 1,
          textTransform: "uppercase",
          fontStyle: "italic",
        }}
      >
        {type}
      </Text>
    </View>
  </View>

  {/* Facility */}
  <Text
    numberOfLines={2}
    style={{
      marginTop: 18,
      fontSize: 30,
      color: "#fff",
      fontWeight: "900",
      fontStyle: "italic",
      textTransform: "uppercase",
      lineHeight: 34,
      marginBottom: 4,
    }}
  >
    {facility}
  </Text>
</View>
       {/* Bottom */}
<View>
  <View
    style={{
      height: 1,
      backgroundColor: "rgba(255,255,255,.15)",
      marginBottom: 16,
    }}
  />

  {/* Started + Credits */}
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <View>
      <Text
        style={{
          color: "#8C8C8C",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        Valid Until
      </Text>

      <Text
        style={{
          color: "#fff",
          fontWeight: "700",
          marginTop: 4,
          fontSize: 16,
        }}
      >
        {formattedEndDate}
      </Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text
        style={{
          color: "#8C8C8C",
          fontSize: 11,
          letterSpacing: 1,
        }}
      >
        CREDITS LEFT
      </Text>

      <Text
        style={{
          color: accent,
          fontSize: 28,
          fontWeight: "900",
          fontStyle: "italic",
        }}
      >
        {credits ?? 0}/{totalCredits}
      </Text>
    </View>
  </View>

  {/* 👇 ADD IT HERE */}
  <Text
    style={{
      marginTop: 10,
      color: "#A0A0A0",
      fontSize: 12,
    }}
  >
    Started  {formattedStartDate}
  </Text>

  {/* BOOK NOW BUTTON */}
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={{
      marginTop: 18,
      backgroundColor: accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: "#000",
        fontWeight: "900",
        fontSize: 16,
        letterSpacing: 1,
      }}
    >
      BOOK NOW
    </Text>
  </TouchableOpacity>
</View>
      </View>
    </TouchableOpacity>
  );
}