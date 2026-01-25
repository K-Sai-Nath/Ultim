import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK JSON DATA                      */
/* ---------------------------------- */

const subscription = {
  plan: "Pro",
  status: "ACTIVE",
  credits: {
    total: 200,
    used: 80,
    available: 120,
  },
  billing: {
    nextBillingDate: "12 Feb 2026",
    cycle: "Monthly",
    amount: "₹299",
    paymentMethod: "UPI",
  },
};

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#f5f5f5" : "#000000";

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
          Subscription
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* CONTENT */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HERO CARD – AVAILABLE CREDITS */}
        <View className="px-4 mt-4">
          <View className="relative overflow-hidden rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
            {/* Decorative Circle */}
            <View className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10" />

            <View className="p-6">
              <Text className="text-sm font-bold uppercase text-text-secondary-light dark:text-text-secondary-dark">
                Available Credits
              </Text>

              <View className="flex-row items-end gap-1 mt-1">
                <Text className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {subscription.credits.available}
                </Text>
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                  pts
                </Text>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-xs italic text-text-secondary-light dark:text-text-secondary-dark">
                  Next billing: {subscription.billing.nextBillingDate}
                </Text>

                <Text className="text-xs font-semibold text-primary">
                  {subscription.plan} · {subscription.billing.cycle}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CREDIT USAGE */}
        <View className="px-4 mt-6">
          <View className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold mb-3">
              Credit Usage
            </Text>

            <UsageRow
              label="Total Credits"
              value={subscription.credits.total}
            />
            <UsageRow label="Used" value={subscription.credits.used} />
            <UsageRow
              label="Remaining"
              value={subscription.credits.available}
              highlight
            />
          </View>
        </View>

        {/* BILLING DETAILS */}
        <View className="px-4 mt-4 mb-10">
          <View className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <Text className="text-text-primary-light dark:text-text-primary-dark font-semibold mb-3">
              Billing Details
            </Text>

            <InfoRow
              label="Next Billing"
              value={subscription.billing.nextBillingDate}
            />
            <InfoRow label="Cycle" value={subscription.billing.cycle} />
            <InfoRow label="Amount" value={subscription.billing.amount} />
            <InfoRow
              label="Payment Method"
              value={subscription.billing.paymentMethod}
            />
            <InfoRow label="Status" value={subscription.status} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

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
        className={`${
          highlight
            ? "text-primary font-semibold"
            : "text-text-primary-light dark:text-text-primary-dark"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
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
