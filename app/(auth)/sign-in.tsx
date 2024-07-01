import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../components/FormField";
import { Link, router } from "expo-router";
import CustomButton from "../components/CustomButton";
import { signInWithEmailAndVoice } from "../../lib/appwrite";
import { Audio } from "expo-av";
import { useGlobalContext } from "@/context/GlobalProvider";

const SignIn = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [form, setForm] = useState({
    username: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
    Alert.alert("Stopped recording!");
  };

  const handleVoiceSubmit = async (uri: string) => {
    setIsSubmitting(true);
    try {
      const user = await signInWithEmailAndVoice(form.username.trim(), uri);
      setUser(user);
      setIsLoggedIn(true);
      router.push("/home"); // Redirige a la pantalla principal
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async () => {
    if (!form.username) {
      Alert.alert("Error", "Please enter your user name");
      return;
    }
    startRecording();
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center px-4 my-6">
          <Image
            source={images.veonLogo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-bold">
            Sign In
          </Text>
          <FormField
            title="Your User Name"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
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
            className="text-sm font-psemibold"
            style={{ color: "#F6CA56" }}
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
