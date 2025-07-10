import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const { followUnfollowUser, isFollowingUser } = useFollow(); //using the useFollow hook to handle the follow/unfollow functionality for suggested users

  //below is the query to fetch the suggested users
  const { data: suggestedUsers, isLoading: isLoadingSuggestedUsers } = useQuery(
    {
      queryKey: ["suggestedUsers"],
      queryFn: async () => {
        try {
          const res = await fetch("/api/users/suggested", {
            //actual link to the backend route
            credentials: "include",
          });
          const data = await res.json(); //getting the response from the backend
          if (!res.ok) {
            throw new Error(data.error || "Failed to fetch suggested users");
          }
          return data;
        } catch (error) {
          console.log(error);
          throw new Error(error.message);
        }
      },
    }
  );

  //if there are no suggested users, we're returning an empty div so that UI doesn't look weird
  if (suggestedUsers?.length === 0) {
    return <div className="md:w-64 w-0"></div>;
  }

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoadingSuggestedUsers && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoadingSuggestedUsers &&
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      followUnfollowUser(user._id); //calling the followUnfollowUser mutation function to follow/unfollow the user and update the UI
                    }}
                  >
                    {isFollowingUser ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <span>Follow</span>
                    )}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
