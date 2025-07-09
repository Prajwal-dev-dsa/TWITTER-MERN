import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      //user who created the post
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      //text of the post
      type: String,
    },
    img: {
      //image of the post
      type: String,
    },
    likes: [
      //likes on the post
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      //comments on the post
      {
        text: {
          //text of the comment
          type: String,
          required: true,
        },
        user: {
          //user who commented on the post
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
