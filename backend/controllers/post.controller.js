import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find() //find all posts
      .sort({ createdAt: -1 }) //sort by createdAt in descending order (newest first)
      .populate({
        path: "user", //populate the user who created the post
        select: "-password", //select all fields except password
      })
      .populate({
        path: "comments.user", //populate the user who commented on the post
        select: "-password", //select all fields except password
      });

    //if there are no posts, return an empty array
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    //if there are posts, return the posts
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in getAllPosts: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body; //text of the post
    let { img } = req.body; //image of the post
    const userId = req.user._id; //user who created the post

    //check if fields are empty
    if (!text && !img) {
      return res.status(400).json({ message: "Text or image is required" });
    }

    //if image is provided, upload it to cloudinary
    if (img) {
      const result = await cloudinary.uploader.upload(img);
      img = result.secure_url;
    }

    //check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //create post
    const newPost = await Post.create({ text, img, user: userId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in createPost: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id; //post id will be in the params
    const post = await Post.findById(postId); //find the post by id

    //check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //check if user is the owner of the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //delete the image from cloudinary
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0]; //get the image id from the image url
      await cloudinary.uploader.destroy(imgId); //delete the image from cloudinary
    }

    //delete the post
    await post.deleteOne({ _id: postId });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in deletePost: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id; //post id will be in the params
    const post = await Post.findById(postId); //find the post by id
    const userId = req.user._id; //user who commented on the post

    //check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //create comment
    const { text } = req.body; //text of the comment
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    //create a new comment object
    const newComment = {
      text,
      user: userId,
    };

    //add comment to the comments array of the post
    post.comments.push(newComment);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.log(`Error in commentOnPost: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const likeUnLikePost = async (req, res) => {
  try {
    const postId = req.params.id; //post id will be in the params
    const post = await Post.findById(postId); //find the post by id
    const userId = req.user._id; //user who liked the post
    const user = await User.findById(userId); //find the user by id

    //check if post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //check if user has already liked the post
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      //remove user from the likes array of the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });

      //update the cache for the post that is unliked
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      //remove post from the likedPosts array of the user
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      //save the post
      await post.save();

      //save the user
      await user.save();
      res.status(200).json(updatedLikes);
    } else {
      //add user to the likes array of the post
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });

      //update the cache for the post that is liked
      const updatedLikes = [...post.likes, userId];

      //add post to the likedPosts array of the user
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      //add notification to the user for the person who liked the post
      const notification = {
        from: userId, //user who liked the post
        to: post.user, //user who the post belongs to
        type: "like", //type of notification
      };

      //create and save the notification
      await Notification.create(notification);

      //save the post
      await post.save();

      //save the user
      await user.save();
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log(`Error in likeUnLikePost: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id; //user id will be in the params
    const user = await User.findById(userId); //find the user for whose liked posts are being fetched

    //check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //get liked posts
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) //find posts that are in the likedPosts array of the user
      .sort({ createdAt: -1 }) //sort by createdAt in descending order (newest first)
      .populate({
        path: "user", //populate the user who created the post
        select: "-password", //select all fields except password
      })
      .populate({
        path: "comments.user", //populate the user who commented on the post
        select: "-password", //select all fields except password
      });

    //if there are no liked posts, return an empty array
    if (likedPosts.length === 0) {
      return res.status(200).json([]);
    }

    //if there are liked posts, return the liked posts
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Error in getLikedPosts: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id; //user id will be in the request
    const user = await User.findById(userId); //find the user for whose following posts are being fetched

    //check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //get all the posts of the users the current user is following to
    const followingPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 }) //sort by createdAt in descending order (newest first)
      .populate({
        path: "user", //populate the user who created the post
        select: "-password", //select all fields except password
      })
      .populate({
        path: "comments.user", //populate the user who commented on the post
        select: "-password", //select all fields except password
      });

    //if there are no following posts, return an empty array
    if (followingPosts.length === 0) {
      return res.status(200).json([]);
    }

    //if there are following posts, return the following posts
    res.status(200).json(followingPosts);
  } catch (error) {
    console.log(`Error in getFollowingPosts: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const username = req.params.username; //username will be in the params
    const user = await User.findOne({ username }); //find the user by username

    //check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //get all the posts of the user
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 }) //sort by createdAt in descending order (newest first)
      .populate({
        path: "user", //populate the user who created the post
        select: "-password", //select all fields except password
      })
      .populate({
        path: "comments.user", //populate the user who commented on the post
        select: "-password", //select all fields except password
      });

    //if there are no user posts, return an empty array
    if (userPosts.length === 0) {
      return res.status(200).json([]);
    }

    //if there are user posts, return the user posts
    res.status(200).json(userPosts);
  } catch (error) {
    console.log(`Error in getUserPosts: ${error}`);
    res.status(500).json({ message: error.message });
  }
};
