import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
import { router } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Audio } from "expo-av";
import RecordingGif from "../components/RecordingGif";
import * as FileSystem from "expo-file-system";
import RNFetchBlob from "rn-fetch-blob";

const SignUp = () => {
  const { setIsLoggedIn, setUser } = useGlobalContext();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    password_confirm: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedURI, setRecordedURI] = useState<string | null>(null);
  const [convertedURI, setConvertedURI] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        if (recording.current) {
          await recording.current.stopAndUnloadAsync();
          recording.current = null;
        }
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }
        soundRef.current = null;

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
        setRecordedURI(uri);

        // Convert .m4a to .mp4
        const mp4URI = uri.replace(".m4a", ".mp4");
        await FileSystem.moveAsync({
          from: uri,
          to: mp4URI,
        });
        setConvertedURI(mp4URI);
      }
      recording.current = null;

      console.log("Recorded audio file: ", convertedURI);
    }
    Alert.alert("Stopped recording!");
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);

    try {
      // Sign up with email, username and password
      console.log("Signing up with: ", form);
      const signUpResponse = await fetch(
        "https://verifyapi.vdev.website/authorization/v2/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                auth {
                  sign_up(email: "${form.email.trim()}", username: "${form.username.trim()}", password: "${form.password.trim()}", password_confirm: "${form.password_confirm.trim()}") {
                    ... on UserAuth {
                      id
                      username
                      access_token
                    }
                    ... on ValidationErrorsList {
                      errors {
                        field
                        messages
                      }
                    }
                  }
                }
              }
            `,
          }),
        }
      );

      const signUpData = await signUpResponse.json();
      console.log("Sign up response data: ", signUpData);

      if (signUpData.errors) {
        throw new Error(signUpData.errors[0].messages[0]);
      }

      const user = signUpData.data.auth.sign_up;
      console.log("user", user);
      setUser(user);

      // Fetch the audio file from the converted URI
      console.log("Fetching audio file from URI: ", convertedURI);

      if (!convertedURI) {
        throw new Error("Converted URI is null");
      }

      // Log token and URL
      const uploadUrl = `https://verifyapi.vdev.website/authorization/v2/upload/main`;
      console.log("Upload URL: ", uploadUrl);
      console.log("Access Token: ", user.access_token);

      // Upload the audio file with expo-file-system
      console.log("Uploading audio file...");
      const uploadResponse = await FileSystem.uploadAsync(
        uploadUrl,
        convertedURI,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            "Content-Type": "multipart/form-data",
          },
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
        }
      );

      console.log("Upload response status: ", uploadResponse.status);
      if (uploadResponse.status !== 200) {
        const errorResponse = uploadResponse.body;
        console.error("Failed to upload audio file: ", errorResponse);
        throw new Error("Failed to upload audio file");
      }

      const responseData = JSON.parse(uploadResponse.body);
      console.log("Upload response data: ", responseData);

      setIsLoggedIn(true);
      router.push("/home");
    } catch (error: any) {
      console.error("Error: ", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const playRecording = async () => {
    try {
      let newSound;
      if (sound) {
        newSound = sound;
      } else if (soundRef.current) {
        newSound = soundRef.current;
      } else {
        const { sound: createdSound } = await Audio.Sound.createAsync({
          uri: convertedURI || "",
        });
        newSound = createdSound;
        soundRef.current = createdSound;
        setSound(createdSound);
      }

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await newSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing recording", error);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
    } else if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
    setIsPlaying(false);
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
            title="Your Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Your Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Your Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            secureTextEntry
          />

          <FormField
            title="Confirm Password"
            value={form.password_confirm}
            handleChangeText={(e) => setForm({ ...form, password_confirm: e })}
            otherStyles="mt-7"
            secureTextEntry
          />

          {isRecording && <RecordingGif />}

          <CustomButton
            title={isRecording ? "Stop Recording" : "Start Recording"}
            handlePress={isRecording ? stopRecording : startRecording}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          {recordedURI && !isRecording && (
            <>
              {!isPlaying ? (
                <CustomButton
                  title="Play Recorded Audio"
                  handlePress={playRecording}
                  containerStyles="mt-7"
                />
              ) : (
                <CustomButton
                  title="Stop Playback"
                  handlePress={stopPlayback}
                  containerStyles="mt-7"
                />
              )}
              <CustomButton
                title="Sign Up"
                handlePress={handleSignUp}
                containerStyles="mt-7"
                isLoading={isSubmitting}
                // disabled={
                //   !form.email ||
                //   !form.username ||
                //   !form.password ||
                //   !form.password_confirm ||
                //   !recordedURI
                // }
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});

function atob(input: any) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = input.replace(/=+$/, "");
  let output = "";

  if (str.length % 4 == 1) {
    throw new Error(
      "'atob' failed: The string to be decoded is not correctly encoded."
    );
  }
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
