import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    //validation
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    //check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    //password validation
    if (password.length < 3) {
      return res
        .status(400)
        .json({ message: "Password must be at least 3 characters long" });
    }

    //hash password
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //create user
    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    //set cookie
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res); //generate token and then set cookie
      await newUser.save();
      res.status(201).json({
        //sedning the entire user object to the client
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log(`Error in signup controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    //validation
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    //compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    ); //user?.password || "" is used to handle the case when user is not found, so that it doesn't throw an error.
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    //set cookie
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
    });
  } catch (error) {
    console.log(`Error in login controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); //maxAge: 0 means the cookie will be deleted immediately, and jwt has been set to empty string.
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(`Error in logout controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); //selecting the user id to get the authenticated user and excluding the password so that we don't send the password to the client.
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error in getMe controller: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
