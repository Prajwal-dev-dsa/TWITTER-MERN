import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    //this function is used to get the post endpoint based on the feed type
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POSTS_ENDPOINT = getPostEndpoint(); //this is the endpoint for the posts

  //below is the query to fetch the posts from the backend
  const {
    data: posts, //using data as posts
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"], //this is the query key for the posts
    queryFn: async () => {
      try {
        const response = await fetch(POSTS_ENDPOINT); //actual link to the backend route
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch posts");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  //below is the useEffect to refetch the posts when the feed type changes or when the page is loaded or when the username or userId changes
  useEffect(() => {
    refetch();
  }, [feedType, refetch, username, userId]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
