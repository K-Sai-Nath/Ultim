import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpCenterScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconPrimary = isDark ? "#f5f5f5" : "#000000";

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

        <Text className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
          Help Center
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <HelpCard
          title="How do I book a class?"
          description="Browse venues, select a class, choose a time slot, and confirm your booking using credits or payment."
        />

        <HelpCard
          title="How can I cancel a booking?"
          description="Open your booking details and tap Cancel. Cancellation policies vary by venue."
        />

        <HelpCard
          title="What are credits?"
          description="Credits are used to book classes. They can be purchased or earned through offers."
        />

        <HelpCard
          title="Why was my booking cancelled?"
          description="Bookings may be cancelled due to venue issues, schedule changes, or policy violations."
        />

        <HelpCard
          title="How do I contact support?"
          description="You can reach out through the Contact Support page for personalized help."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENT                           */
/* ---------------------------------- */

function HelpCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="mb-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
      <Text className="mb-2 text-base font-bold text-text-primary-light dark:text-text-primary-dark">
        {title}
      </Text>
      <Text className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
        {description}
      </Text>
    </View>
  );
}
