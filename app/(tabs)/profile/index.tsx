import { useAuth } from "@/context/AuthContext";
import { getAccessToken, removeAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Membership = {
  id: number;
  startDate: string;
  endDate: string;
  availableCredits: number | null;
  membershipPlan: {
    planName: string;
    category: string;
    planPrice: number;
  };
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { setUser } = useAuth();

  const iconPrimary = isDark ? "#f5f5f5" : "#000000";
  const iconSecondary = isDark ? "#a1a1aa" : "#9ca3af";

  const fetchMemberships = async (): Promise<Membership[]> => {
    const token = await getAccessToken();
    if (!token) throw new Error("No token");

    const res = await axios.get(
      "https://ultim-server.vercel.app/api/memberships",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.docs || [];
  };

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchMemberships,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconPrimary} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Profile
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------- MEMBERSHIP GRID ---------------- */}
        <Card title="Your Plans">
          {isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator size="large" color="#ff7b00" />
              <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Loading plans...
              </Text>
            </View>
          ) : plans.length === 0 ? (
            <View className="items-center py-6">
              <MaterialIcons
                name="card-membership"
                size={32}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No active memberships
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between gap-y-4 px-2 pb-3">
              {plans.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push(`/(stack)/subscription/${item.id}`)
                  }
                  activeOpacity={0.9}
                  className="
                  w-[48%]
                  rounded-2xl
                  p-4
                  bg-white
                  dark:bg-card-dark
                  border-2
                  border-gray-200
                  dark:border-border-dark
                "
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.12,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 10,
                  }}
                >
                  <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                    {item.membershipPlan.planName}
                  </Text>

                  <Text className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Credits
                  </Text>

                  <Text className="text-lg font-bold text-primary">
                    {item.availableCredits ?? 0}
                  </Text>

                  <Text className="mt-2 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                    Valid till {new Date(item.endDate).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
        {/* ---------------- ACCOUNT CARD ---------------- */}
        <Card title="Account">
          <ProfileRow
            icon="notifications"
            label="Notifications"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/notifications")}
          />
          <ProfileRow
            icon="receipt-long"
            label="Transaction History"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/transactions")}
          />
        </Card>

        {/* ---------------- SUPPORT CARD ---------------- */}
        <Card title="Support">
          <ProfileRow
            icon="description"
            label="Terms & Conditions"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/termsConditions")}
          />
          <ProfileRow
            icon="help-center"
            label="Help Center"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/helpCenter")}
          />
          <ProfileRow
            icon="support-agent"
            label="Contact Support"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/contactSupport")}
          />
        </Card>

        {/* ---------------- LOGOUT ---------------- */}
        <View className="mt-2">
          <TouchableOpacity
            className="w-full rounded-lg bg-primary py-3 items-center"
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert("Log Out", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log Out",
                  style: "destructive",
                  onPress: async () => {
                    await removeAccessToken();
                    setUser(null);
                    router.replace("/(auth)/login");
                  },
                },
              ])
            }
          >
            <Text className="text-base font-bold text-white">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* REUSABLE COMPONENTS                 */
/* ---------------------------------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6 rounded-xl bg-card-light dark:bg-card-dark p-2 border border-border-light dark:border-border-dark">
      <Text className="px-3 pt-3 pb-1 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
        {title}
      </Text>
      {children}
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  onPress,
  iconColor,
  chevronColor,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  iconColor: string;
  chevronColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-3 min-h-[56px] rounded-lg"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 items-center justify-center">
          <MaterialIcons name={icon} size={22} color={iconColor} />
        </View>
        <Text className="text-base font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={22} color={chevronColor} />
    </TouchableOpacity>
  );
}
