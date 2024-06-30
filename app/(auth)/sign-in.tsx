import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../components/FormField";
import { Link, router } from "expo-router";
import CustomButton from "../components/CustomButton";
import { getCurrentUser, signIn, closeSession } from "@/lib/appwrite";

import { useGlobalContext } from "@/context/GlobalProvider";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [isSsubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setIsSubmitting(true);

    try {
      await signIn(form.email.trim(), form.password.trim());
      const result = await getCurrentUser();

      if (result) {
        setUser(result);
        setIsLoggedIn(true);
        router.replace("/home");
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        (error.message.split(":")[1] + error.message.split(":")[2]).trim()
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psmibold">
            Sign In
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyBoardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />
        </View>
        <CustomButton
          title="Sign In"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={isSsubmitting}
        />
        <View className="justify-center flex-row gap-2 pt-5 items-center">
          <Text className="text-lg font-pregular text-gray-100">
            Don't have an account?
          </Text>
          <Link
            href="/sign-up"
            className="text-sm font-psemibold text-secondary "
          >
            Sign up
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({});
