import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------------------------------- */
/* SCREEN                              */
/* ---------------------------------- */

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconPrimary = isDark ? "#f5f5f5" : "#000000";
  const iconSecondary = isDark ? "#a1a1aa" : "#9ca3af";

  const showAlert = (title: string) => {
    Alert.alert(title, "Action clicked (route will be added later)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
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
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        {/* Profile Summary */}
        <View className="mt-4 mb-8">
          <View
            className="rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark px-5 py-4"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >
            {/* Member label */}
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Member
            </Text>

            {/* Name */}
            <Text className="mt-1 text-[22px] font-bold text-text-primary-light dark:text-text-primary-dark">
              Alex Doe
            </Text>

            {/* Member ID */}
            <Text className="mt-0.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Member ID: <Text className="font-medium">GYM-10234</Text>
            </Text>

            {/* Credits + Plan */}
            <View className="mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Available Credits
                </Text>
                <Text className="text-lg font-bold text-primary">150</Text>
              </View>

              {/* Plan Status */}
              <View className="rounded-full bg-primary/10 px-4 py-1">
                <Text className="text-sm font-semibold text-primary">
                  Active Plan
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Card */}
        <Card title="Account">
          <ProfileRow
            icon="card-membership"
            label="Subscription Details"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => Alert.alert("Clicked on Subscription details")}
          />
          <ProfileRow
            icon="notifications"
            label="Notifications"
            iconColor={iconPrimary}
            chevronColor={iconSecondary}
            onPress={() => router.push("/(stack)/notifications")}
          />
        </Card>

        {/* Support Card */}
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

        {/* Logout */}
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
                  onPress: () => showAlert("Logged Out"),
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
    <View
      className="mb-6 rounded-xl bg-card-light dark:bg-card-dark p-2 border border-border-light dark:border-border-dark"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }}
    >
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
