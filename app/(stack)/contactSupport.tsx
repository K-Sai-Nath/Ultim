import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactSupportScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconPrimary = isDark ? "#f5f5f5" : "#000000";

  /* ---------------------------------- */
  /* ACTION HANDLERS                     */
  /* ---------------------------------- */

  const handleEmail = () => {
    Linking.openURL("mailto:support@ultim.app");
  };

  const handleCall = () => {
    Linking.openURL("tel:+1234567890");
  };

  const handleLiveChat = () => {
    Alert.alert("Coming Soon", "Live chat support will be available soon.");
  };

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
          Contact Support
        </Text>

        <View className="w-10 h-10" />
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-6 gap-4">
        <SupportCard
          icon="email"
          title="Email Support"
          subtitle="support@ultim.app"
          onPress={handleEmail}
        />

        <SupportCard
          icon="chat"
          title="Live Chat"
          subtitle="Chat with our support team"
          onPress={handleLiveChat}
        />

        <SupportCard
          icon="call"
          title="Call Us"
          subtitle="+1 234 567 890"
          onPress={handleCall}
        />
      </View>
    </SafeAreaView>
  );
}

/* ---------------------------------- */
/* COMPONENT                           */
/* ---------------------------------- */

function SupportCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4"
    >
      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
        <MaterialIcons name={icon} size={24} color="#ff7b00" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
