import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
import { signUpWithEmailAndVoice } from "../../lib/appwrite";
import { router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Audio, ResizeMode, Video } from "expo-av";

const SignUp = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [form, setForm] = useState({
    username: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

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
      const user = await signUpWithEmailAndVoice(form.username.trim(), uri);
      setUser(user);
      setIsLoggedIn(true);
      router.push("/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const playRecording = async () => {
    if (sound) {
      await sound.playAsync();
    } else if (soundRef.current) {
      await soundRef.current.playAsync();
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: recording.current?.getURI() || "",
      });
      soundRef.current = newSound;
      setSound(newSound);
      await newSound.playAsync();
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
    } else if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full px-4 my-6">
          <View
            style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}
          >
            <Image
              source={images.veonLogo}
              resizeMode="cover"
              style={{ width: 115, height: 35 }}
            />
          </View>
          <Text className="text-2xl text-white text-semibold mt-10 font-bold text-center">
            Sign up to Irapp
          </Text>
          <Image
            source={images.path}
            resizeMode="contain"
            style={{
              position: "relative",
              left: 205,
              top: -17,
              width: 65,
            }}
          />

          <FormField
            title="Your Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

          {isRecording ? (
            <View
              style={{
                width: 300,
                height: 300,
                alignSelf: "center",
                marginTop: 30,
              }}
            >
              <Video
                source={require("../../assets/images/audio-bar-spectrum.mp4")}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                style={{ width: "100%", height: "100%", position: "absolute" }}
              />
              <View
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "absolute",
                }}
              />
            </View>
          ) : (
            <CustomButton
              title="Start Recording"
              handlePress={startRecording}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />
          )}

          {!isRecording && (
            <>
              <CustomButton
                title="Play Recorded Audio"
                handlePress={playRecording}
                containerStyles="mt-7"
              />
              <CustomButton
                title="Stop Playback"
                handlePress={stopPlayback}
                containerStyles="mt-7"
              />
            </>
          )}

          {isRecording && (
            <CustomButton
              title="Stop Recording"
              handlePress={stopRecording}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
