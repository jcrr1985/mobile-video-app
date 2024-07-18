import { ResizeMode, Video } from "expo-av";
import React from "react";
import { View } from "react-native";

const RecordingGif = () => {
  return (
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
  );
};

export default RecordingGif;
