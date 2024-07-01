import * as SplashScreen from "expo-splash-screen";
import { Image, ScrollView, Text, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "./components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { Link, Redirect, router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoading, isLoggedIn } = useGlobalContext();
  if (!isLoading && isLoggedIn) {
    return <Redirect href="/home" />;
  }
  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View className="w-full justify-center items-center flex-1 px-4">
          <Image
            source={images.veonLogo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <CustomButton
            title="log in"
            handlePress={() => console.log("Log in")}
            containerStyles="mt-7 w-full"
            isLoading={false}
          />
          <CustomButton
            title="Sign up"
            handlePress={() => {
              router.push("/sign-up");
            }}
            containerStyles="mt-7 w-full"
            isLoading={false}
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
