import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* MOCK TRANSACTIONS                   */
/* ---------------------------------- */

const transactions = [
  {
    id: "1",
    title: "Badminton Session",
    date: "10 Oct 2026",
    credits: -100,
  },
  {
    id: "2",
    title: "Gym Session",
    date: "08 Oct 2026",
    credits: -50,
  },
  {
    id: "3",
    title: "Yoga Session",
    date: "05 Oct 2026",
    credits: -30,
  },
  {
    id: "4",
    title: "Plan Recharge",
    date: "01 Oct 2026",
    credits: +200,
  },
];

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconPrimary = isDark ? "#f5f5f5" : "#000";
  const iconSecondary = isDark ? "#9ca3af" : "#6b7280";

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? "#0f0f0f" : "#ffffff" }}
    >
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={iconPrimary} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Transaction History
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* CONTENT */}
      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {transactions.map((item) => (
          <TransactionRow key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENTS                          */
/* ---------------------------------- */

function TransactionRow({ item }: any) {
  const isCreditAdded = item.credits > 0;

  return (
    <View
      className="
          mb-3 rounded-xl
          bg-card-light dark:bg-card-dark
          border border-border-light dark:border-border-dark
          px-4 py-4
        "
    >
      <View className="flex-row items-center gap-4">
        {/* FIXED ICON */}
        <View
          className="
              w-12 h-12 rounded-full
              items-center justify-center
              bg-primary/10
            "
        >
          <MaterialIcons
            name="account-balance-wallet"
            size={22}
            color="#ff7b00"
          />
        </View>

        {/* CONTENT */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
            {item.title}
          </Text>

          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            {item.date}
          </Text>
        </View>

        {/* CREDITS */}
        <View className="items-end">
          <Text
            className={`text-base font-bold ${
              isCreditAdded ? "text-green-500" : "text-red-500"
            }`}
          >
            {isCreditAdded ? "+" : ""}
            {item.credits} pts
          </Text>

          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {isCreditAdded ? "Credited" : "Used"}
          </Text>
        </View>
      </View>
    </View>
  );
}
