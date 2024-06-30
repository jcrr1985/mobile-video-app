import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { icons } from "../../constants";
import { router, usePathname } from "expo-router";

type InputProps = {
  title: string;
  value: string;
  handleChangeText: (e: any) => void;
  otherStyles: string;
  placeholder?: string;
  keyBoardType?: string;
  initialQuery?: string | undefined;
};

const SearchInput: React.FC<InputProps> = ({
  title,
  value,
  handleChangeText,
  otherStyles,
  placeholder,
  initialQuery,
}) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery ?? "");

  return (
    <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        className="flex-1 text-white font-pregular text-base mt-0.5"
        value={query}
        placeholder="Search for a video topic"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
      />
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert(
              "Missing query",
              "Please enter a query to search across database"
            );
          }
          if (!pathname.startsWith("/search")) {
            router.push(`/search/${query}`);
          } else {
            router.setParams({ query });
          }
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
