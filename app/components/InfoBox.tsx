import { StyleSheet, Text, View } from "react-native";
import React from "react";
interface InfoBoxProps {
  title: number | string;
  containerStyles?: string;
  titleStyles?: string;
  subtitle?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  subtitle,
  containerStyles,
  titleStyles,
}) => {
  return (
    <View className={`${containerStyles}`}>
      <Text className={`${titleStyles} text-white text-center`}>{title}</Text>
      <Text className="text-sm text-gray-100 text-center font-pregular">
        {" "}
        {subtitle}
      </Text>
    </View>
  );
};

export default InfoBox;

const styles = StyleSheet.create({});
