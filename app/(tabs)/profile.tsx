import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import { signOut, userPosts } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import VideoCard from "../components/VideoCard";
import { icons } from "@/constants";

import { useGlobalContext } from "@/context/GlobalProvider";
import InfoBox from "../components/InfoBox";
import { router } from "expo-router";
import { RefreshControl } from "react-native-gesture-handler";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  console.log("user", user);
  const { data: posts, refetch } = useAppwrite(() => userPosts(user.$id));

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item: any) => item.$id}
        renderItem={({ item }) => <VideoCard item={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              ></Image>
            </TouchableOpacity>
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
                source={{ uri: user?.avatar }}
              />
            </View>
            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
            <View className="mt-5 flex flex-row ">
              <InfoBox
                title={posts?.length || 0}
                containerStyles="mr-10"
                titleStyles="text-xl"
                subtitle="Posts"
              />
              <InfoBox
                title="1.2k"
                titleStyles="text-xl"
                subtitle="Followers"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos found"
            subtitle="No videos found for this query"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
