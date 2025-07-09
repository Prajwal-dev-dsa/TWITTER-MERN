import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  //signing the token with the user id so that next time when user sends any requests, we can verify the token by checking which person has this token with the help of userId.
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //cookie is only accessible by the web browser, not by the client side javascript
    sameSite: "strict", //prevents CSRF attacks
    secure: process.env.NODE_ENV !== "development", //will only be true in production mode
    maxAge: 1000 * 60 * 60 * 24 * 15, //will be logged out after 15 days
  });
};
