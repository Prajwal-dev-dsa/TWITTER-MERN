import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] }); //we're using this to check who is the current user
  const queryClient = useQueryClient(); //we're using this to invalidate the posts query to refetch the posts

  //below is the mutation function to delete the post, it will hit the backend and delete the post from the database
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          //actual link to the backend route
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json(); //getting the response from the backend
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete post");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] }); //invalidating the posts query to refetch the posts
    },
  });

  const [localLikes, setLocalLikes] = useState(post.likes || []); //we're using this to update the UI without refetching the posts
  const isLiked = localLikes.includes(authUser?._id); //we're using this to check if the post is liked by the current user

  //below is the mutation function to like/unlike a post, it will hit the backend and like/unlike the post in the database
  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        //actual link to the backend route
        method: "POST",
        credentials: "include",
      });
      const data = await res.json(); //getting the response from the backend
      if (!res.ok) throw new Error(data.error || "Failed to like/unlike post");
      return data;
    },
    onSuccess: (updatedLikes) => {
      //below code is commented because this is not the best UX. As it will refetch all posts and the UI will look weird.
      //its just for the sake of testing.
      // queryClient.invalidateQueries({ queryKey: ["posts"] }); //invalidating the posts query to refetch the posts

      //instead we're using the below code to update the UI without refetching the posts
      //we will update the cache directly for the post that is liked/unliked

      setLocalLikes(updatedLikes); //updating the local likes state to update the UI without refetching the posts
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) =>
          //updating the cache directly for the post that is liked/unliked by checking the post id and updating the likes array of the post with the new likes array that we got from the backend
          p._id === post._id ? { ...p, likes: updatedLikes } : p
        );
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const postOwner = post.user;

  const isMyPost = authUser?._id === post.user._id; //checking if the current user is the owner of the post

  const formattedDate = "1h";

  const isCommenting = false;

  //delete post function to delete the post
  const handleDeletePost = () => {
    if (isMyPost) {
      deletePost();
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
  };

  //handleLikePost function to like/unlike a post
  const handleLikePost = () => {
    if (isLikingPost) return; //if post is already getting liked we will return, otherwise we will call the likePost mutation function again to like/unlike the post.
    likePost();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeletingPost && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}
                {isDeletingPost && <LoadingSpinner size={"sm"} />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLikingPost && <LoadingSpinner size="sm" />}
                {!isLikingPost && !isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {!isLikingPost && isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes?.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
