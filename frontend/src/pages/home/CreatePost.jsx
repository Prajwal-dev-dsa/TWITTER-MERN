import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreatePost = () => {
  const [text, setText] = useState(""); //state to store the text of the post
  const [img, setImg] = useState(null); //state to store the image of the post
  const imgRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] }); //we're using this to get the current user who is logged in
  const queryClient = useQueryClient(); //we're using this to invalidate the posts query to refetch the posts

  //below is the mutation function to create the post, it will hit the backend and create the post in the database
  const {
    mutate: createPost,
    isPending: isCreatingPost,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/posts/create", {
          //actual link to the backend route
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json(); //getting the response from the backend
        if (!res.ok) {
          throw new Error(data.error || "Failed to create post");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] }); //invalidating the posts query to refetch the posts
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  //below is the function to handle the submission of the post
  const handleSubmit = (e) => {
    e.preventDefault();
    //resetting the text and image states for better user experience
    setText("");
    setImg(null);
    createPost({ text, img }); //calling the createPost mutation function to create the post in the database
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isCreatingPost ? <LoadingSpinner size="sm" /> : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;
