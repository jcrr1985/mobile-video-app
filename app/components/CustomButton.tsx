import { StyleSheet, Text } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import { Colors } from "../../constants/Colors";

type ButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyles?: object | string;
  textStyles?: object | string;
  isLoading?: boolean;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      style={{ backgroundColor: "#F6CA56" }}
      disabled={disabled}
    >
      <Text className={`font-psemibold text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({});
