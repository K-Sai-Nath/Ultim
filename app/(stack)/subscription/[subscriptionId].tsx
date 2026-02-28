import { getAccessToken } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  amountDue: number;
  membershipPlan: {
    planName: string;
    planPrice: number;
    Duration: string;
    creditsOffered: number;
  };
};

export default function SubscriptionScreen() {
  const { subscriptionId } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000000";

  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const token = await getAccessToken();

        const res = await axios.get(
          `https://ultim-server.vercel.app/api/memberships/${subscriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMembership(res.data);
      } catch (err) {
        console.log("Failed to load subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) {
      fetchMembership();
    }
  }, [subscriptionId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-text-secondary-light dark:text-text-secondary-dark">
          Loading subscription...
        </Text>
      </SafeAreaView>
    );
  }

  if (!membership) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <Text className="text-text-primary-light dark:text-text-primary-dark">
          Subscription not found
        </Text>
      </SafeAreaView>
    );
  }

  const totalCredits = membership.membershipPlan.creditsOffered;
  const availableCredits = membership.availableCredits ?? 0;
  const usedCredits = totalCredits - availableCredits;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Subscription Details
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO CARD */}
        <View className="px-4 mt-4">
          <View className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6">
            <Text className="text-sm uppercase text-text-secondary-light dark:text-text-secondary-dark">
              Available Credits
            </Text>

            <Text className="text-4xl font-bold mt-1 text-text-primary-light dark:text-text-primary-dark">
              {availableCredits}
            </Text>

            <Text className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Valid till {new Date(membership.endDate).toLocaleDateString()}
            </Text>

            <Text className="mt-2 text-primary font-semibold">
              {membership.membershipPlan.planName}
            </Text>
          </View>
        </View>

        {/* CREDIT USAGE */}
        <View className="px-4 mt-6">
          <View className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <Text className="font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">
              Credit Usage
            </Text>

            <UsageRow label="Total Credits" value={totalCredits} />
            <UsageRow label="Used" value={usedCredits} />
            <UsageRow label="Remaining" value={availableCredits} highlight />
          </View>
        </View>

        {/* BILLING DETAILS */}
        <View className="px-4 mt-4 mb-10">
          <View className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <Text className="font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">
              Billing Details
            </Text>

            <InfoRow
              label="Start Date"
              value={new Date(membership.startDate).toLocaleDateString()}
            />
            <InfoRow
              label="End Date"
              value={new Date(membership.endDate).toLocaleDateString()}
            />
            <InfoRow label="Amount Due" value={`₹${membership.amountDue}`} />
            <InfoRow
              label="Plan Duration"
              value={`${membership.membershipPlan.Duration} Month`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* COMPONENTS */

function UsageRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text
        className={
          highlight
            ? "text-primary font-semibold"
            : "text-text-primary-light dark:text-text-primary-dark"
        }
      >
        {value}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </Text>
      <Text className="text-text-primary-light dark:text-text-primary-dark">
        {value}
      </Text>
    </View>
  );
}
