import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

//this entire hook is specifically build to handle the follow/unfollow functionality. We creating it here and can use it anywhere in the app.
const useFollow = () => {
  const queryClient = useQueryClient(); //we're using this to invalidate the queries to refetch the data

  //below is the mutation function to follow/unfollow a user
  const { mutate: followUnfollowUser, isPending: isFollowingUser } =
    useMutation({
      mutationFn: async (userId) => {
        try {
          const res = await fetch(`/api/users/follow/${userId}`, {
            //actual link to the backend route
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ userId }),
          });
          const data = await res.json(); //getting the response from the backend
          if (!res.ok) {
            throw new Error(data.error || "Failed to follow/unfollow user");
          }
          return data;
        } catch (error) {
          console.log(error);
          throw new Error(error.message);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }); //invalidating the suggested users query to refetch the data. So that the followed user is not shown in the suggested users list.
        queryClient.invalidateQueries({ queryKey: ["authUser"] }); //invalidating the auth user query to refetch the data. So that the followed user is not shown in the auth user's follow list.
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  return { followUnfollowUser, isFollowingUser }; //returning the mutation function and the loading state
};

export default useFollow;
