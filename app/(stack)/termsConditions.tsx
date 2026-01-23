import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function TermsScreen() {
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
          Terms & Conditions
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <TermsCard title="1. Introduction">
          By using the Ultim app, you agree to comply with and be bound by these
          Terms & Conditions. Please read them carefully before using the
          platform.
        </TermsCard>

        <TermsCard title="2. User Responsibilities">
          You are responsible for maintaining the confidentiality of your
          account and for all activities that occur under your account. Any
          misuse may result in suspension or termination.
        </TermsCard>

        <TermsCard title="3. Bookings & Payments">
          All bookings made through Ultim are subject to availability. Payments
          once completed are non-refundable unless explicitly stated otherwise
          by the service provider.
        </TermsCard>

        <TermsCard title="4. Credits & Wallet">
          Credits purchased or earned within the app are non-transferable and
          cannot be redeemed for cash. Ultim reserves the right to modify credit
          rules at any time.
        </TermsCard>

        <TermsCard title="5. Cancellations">
          Cancellation policies vary by venue. Please review the cancellation
          terms shown at the time of booking before confirming your session.
        </TermsCard>

        <TermsCard title="6. Limitation of Liability">
          Ultim is not responsible for any injuries, losses, or damages that may
          occur during sessions booked through the platform.
        </TermsCard>

        <TermsCard title="7. Changes to Terms">
          We may update these Terms & Conditions from time to time. Continued
          use of the app after changes implies acceptance of the revised terms.
        </TermsCard>

        <TermsCard title="8. Contact Us">
          If you have any questions regarding these Terms & Conditions, please
          contact our support team through the app.
        </TermsCard>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* CARD COMPONENT                      */
/* ---------------------------------- */

function TermsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
      <Text className="mb-2 text-base font-bold text-text-primary-light dark:text-text-primary-dark">
        {title}
      </Text>
      <Text className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
        {children}
      </Text>
    </View>
  );
}
