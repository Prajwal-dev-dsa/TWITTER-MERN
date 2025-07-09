import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    //check if the token is present in the cookies
    const token = req.cookies.jwt; //jwt is the name of the cookie
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, no token" });
    }

    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifying the token with the help of the secret key
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }

    //find the user by the id
    const user = await User.findById(decoded.userId).select("-password"); //selecting the user id (as we put the user id in the token) and excluding the password

    //if the user is not found, return an error
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, user not found" });
    }

    req.user = user; //setting the user in the request object so that we can use it in the other routes
    next(); //calling the next middleware
  } catch (error) {
    console.log(`Error in protectedRoute middleware: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
