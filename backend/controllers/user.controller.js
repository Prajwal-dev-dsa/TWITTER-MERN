import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params; //getting username from the request params
    const user = await User.findOne({ username }); //finding user by its username
    if (!user) {
      return res.status(404).json({ message: "User not found" }); //if user not found, return 404 error
    }
    res.status(200).json(user); //if user found, return the user
  } catch (error) {
    console.log(`Error in getUserProfile: ${error}`);
    res.status(500).json({ message: error.message }); //if error, return 500 error
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params; //getting id from the request params of the user to follow or unfollow
    const user = await User.findById(id); //finding user by its id to follow or unfollow
    const currentUser = await User.findById(req.user._id); //getting current user from the request. _id is the id of the current user. This is the current user who is logged in and going to follow or unfollow the user.
    if (!user) {
      return res.status(404).json({ message: "User not found" }); //if user not found, return 404 error
    }

    //if user try to follows himself, return 400 error
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const isFollowing = currentUser.following.includes(id); //checking if the current user is already following the user.

    if (isFollowing) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { followers: currentUser._id },
      }); //removing the current user from the followers of the user to unfollow.

      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: user._id },
      }); //removing the user from the following of the current user to unfollow

      return res.status(200).json({ message: "Unfollowed user" });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $push: { followers: currentUser._id },
      }); //adding the current user to the followers of the user to follow

      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: user._id },
      }); //adding the user to the following of the current user to follow

      //creating a notification for the user who is followed
      await Notification.create({
        from: currentUser._id, //from is the user who is doing the action
        to: user._id, //to is the user who is receiving the notification
        type: "follow", //type is the type of the notification [follow or like]
      });

      return res.status(200).json({ message: "Followed user" });
    }
  } catch (error) {
    console.log(`Error in followUnfollowUser: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id); //getting current user from the request. _id is the id of the current user. This is the current user who is logged in and going to get the suggested users to follow.

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUser._id },
        },
      },
      { $sample: { size: 10 } }, //randomly selecting 10 users
    ]); //getting all users except the current user. As we cannot show ourself as a suggested users.

    const filteredUsers = users.filter((user) => {
      return !currentUser.following.includes(user._id); //filtering the users who are not in the following of the current user.
    });

    const suggestedUsers = filteredUsers.slice(0, 3); //taking only 3 users as suggested users

    //set the password to null for the suggested users. This will not happen in the database. It will only happen in the response.
    suggestedUsers.forEach((user) => {
      user.password = null;
    });

    res.status(200).json(suggestedUsers); //returning the suggested users
  } catch (error) {
    console.log(`Error in getSuggestedUsers: ${error}`);
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    //find the user by its id
    let user = await User.findById(req.user._id);

    //if user not found, return 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if both password are provided
    if (
      (!currentPassword && newPassword) ||
      (currentPassword && !newPassword)
    ) {
      return res.status(400).json({ message: "Both password are required" });
    }

    //password validation
    if (currentPassword && newPassword) {
      //check if the current password is correct
      if (
        currentPassword &&
        !(await bcrypt.compare(currentPassword, user.password))
      ) {
        return res.status(400).json({ message: "Invalid current password" });
      }

      //check new password length
      if (newPassword && newPassword.length < 3) {
        return res
          .status(400)
          .json({ message: "Password must be at least 3 characters long" });
      }

      //we can hash the password here
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    //update profile or cover image
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        ); //deleting the old profile image from the cloudinary so that we don't waste the cloudinary freestorage
      }
      const uploadResponse = await cloudinary.uploader.upload(profileImg); //uploading the profile image to the cloudinary
      profileImg = uploadResponse.secure_url; //setting the profile image to the cloudinary url
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        ); //deleting the old cover image from the cloudinary so that we don't waste the cloudinary freestorage
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg); //uploading the cover image to the cloudinary
      coverImg = uploadResponse.secure_url; //setting the cover image to the cloudinary url
    }

    //update user fields (if provided it will update it with the new value, if not provided it will remain set with the old one)
    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.bio = bio || "";
    user.link = link || "";
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    //save the user
    await user.save();

    //remove password while sending the response to the client (this will not happen in the database. It will only happen in the response)
    user.password = null;

    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  } catch (error) {
    console.log(`Error in updateUserProfile: ${error}`);
    res.status(500).json({ message: error.message });
  }
};
