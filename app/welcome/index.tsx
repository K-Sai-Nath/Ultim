import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Scan Your Way In",
    description:
      "Simply scan the QR code at any partner venue for quick, hassle-free entry.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCTY07ucV8A-mtQCCBRoiQI7qL-7u5wA3NLPSfu204WfqUIbx11YlUeuXvIkjLknlaezNaqilO1wzE6yxHwSfXWYLO_6O6HvsS-TtE1JNfuL0pc3ywGOxrMMHIlrnOesPJNzcmQjvByGwXIMbiuFktOVG7GnNIHMhlXpTWQj7mq_k62v7F3bfCgUFdi_87n_PHWmKUbkTdXIu0Tbh9K4uWXaB8Oa_R9QxuB-RgqX_BKpGsDyNNsY3vzg3X-xhSUYi7FxjCyrSb6t_pW",
  },
  {
    id: "2",
    title: "Find Your Perfect Slot",
    description:
      "Discover and book thousands of fitness and wellness sessions anytime.",
    image:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b72?q=80&w=1200",
  },
  {
    id: "3",
    title: "Track Everything in One Place",
    description: "Manage your credits and subscriptions seamlessly in one app.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAKyOTg9GsB3sBIwE_FJ-watroWGNh-f3JnS51pwbTuTKhqGseGfoxv0bb-0njgYkCoNZqgjmTRLYP_mQBkRboMmL6hTRKhNJ3HFoUxgd1H2KNT4ooi-MCNlGJPYG5BqpZVMR3EfS61Jnb0wgnMlQ06bgbSEMV5L2379EvFXR8m2rwR1-0ZXpIOwhEzu8W9tAYUZXG2vfS8p7XIRTj_k7MPYwFxMFTFDOjLLBSO03lozIUmVYXH-1fbT00oZFvXUZ89aZWZX6c4Vgb",
  },
];

export default function Onboarding() {
  const swiperRef = useRef<SwiperFlatList>(null);
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const nextSlide = () => {
    if (index < slides.length - 1) {
      swiperRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* ===== Pagination Dots ===== */}
      <View className="flex-row justify-center gap-2 pt-4">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-primary" : "bg-primary/30"
            }`}
          />
        ))}
      </View>

      {/* ===== Swiper ===== */}
      <SwiperFlatList
        ref={swiperRef}
        index={0}
        autoplay
        autoplayLoop
        autoplayDelay={3}
        onChangeIndex={({ index }) => setIndex(index)}
        showPagination={false}
      >
        {slides.map((item) => (
          <View
            key={item.id}
            style={{ width }}
            className="items-center px-6 pt-16"
          >
            <Image
              source={{ uri: item.image }}
              resizeMode="cover"
              className="w-full h-[320px] rounded-xl mb-10"
            />

            <Text className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark text-center mb-3">
              {item.title}
            </Text>

            <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark text-center max-w-sm">
              {item.description}
            </Text>
          </View>
        ))}
      </SwiperFlatList>

      {/* ===== Bottom Buttons ===== */}
      <View className="px-6 pb-4">
        <TouchableOpacity
          onPress={nextSlide}
          className="h-12 rounded-xl bg-primary items-center justify-center mb-3"
        >
          <Text className="text-white font-bold text-base">
            {index === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-center font-bold text-text-secondary-light dark:text-text-secondary-dark">
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
