import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { icons } from "@/constants";
import { ResizeMode, Video } from "expo-av";

interface Creator {
  username: string;
  avatar: string;
}

interface VideoProps {
  title: string;
  thumbnail: string;
  video: any;
  creator: Creator;
}

interface VideoCardProps {
  item: VideoProps;
}

const VideoCard: React.FC<VideoCardProps> = ({
  item: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View className="flex-col items-center mb-14 px-4">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
          <View className="pt-2">
            <Image
              source={icons.menu}
              resizeMode="contain"
              className="w-5 h-5"
            />
          </View>
        </View>
      </View>

      {isPlaying ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
        />
      ) : (
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative justify-center"
          onPress={() => {
            setIsPlaying(true);
          }}
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            resizeMode="contain"
            style={styles.playIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  thumbnailContainer: {
    position: "relative",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
});
