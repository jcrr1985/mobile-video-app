import { images } from "@/constants";
import React from "react";
import { Image } from "react-native";

const InclinedLine = () => {
  return (
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
  );
};

export default InclinedLine;
