import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../components/FormField";
import { Link, router } from "expo-router";
import CustomButton from "../components/CustomButton";
import { getCurrentUser, signInWithVoice, closeSession } from "@/lib/appwrite";

import { useGlobalContext } from "@/context/GlobalProvider";
import { Audio } from "expo-av";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
  });

  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Define the type for the recording ref
  const recording = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recording.current = newRecording;
        setIsRecording(true);
      } else {
        Alert.alert("Permission to access microphone is required!");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recording.current) {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      if (uri) {
        handleVoiceSubmit(uri);
      }
    }
  };

  const handleVoiceSubmit = async (uri: string) => {
    setIsSubmitting(true);
    try {
      await signInWithVoice(form.email.trim(), uri);
      const result = await getCurrentUser();
      if (result) {
        setUser(result);
        setIsLoggedIn(true);
        router.replace("/home");
      } else {
        Alert.alert("Error", "Invalid email or voice");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async () => {
    if (!form.email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    startRecording();
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
        </View>
        <CustomButton
          title={isRecording ? "Stop Recording" : "Start Recording"}
          handlePress={isRecording ? stopRecording : submit}
          containerStyles="mt-7"
          isLoading={isSubmitting}
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
