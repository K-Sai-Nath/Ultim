import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  return (
    <SafeAreaView>
      <View className="flex-1 justify-center bg-black">
        <Text>Home</Text>
      </View>
    </SafeAreaView>
  );
};

export default Home;
