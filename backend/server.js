import path from "path";
import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import connectMongoDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

dotenv.config(); //help to load the environment variables from the .env file

//cloudinary config to upload the images to the cloud
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000; //port
const __dirname = path.resolve(); //to get the current directory

app.use(express.json({ limit: "5mb" })); //to parse the request body, helps to access the request body
//NOTE: we're using limit to 5mb to prevent the server from crashing due to large file uploads (DoS attacks)

app.use(express.urlencoded({ extended: true })); //to parse the form data, helps to access the form data

app.use(cookieParser()); //to parse the cookie, helps to access the cookie

app.use("/api/auth", authRoutes); //authRoutes
app.use("/api/users", userRoutes); //userRoutes
app.use("/api/posts", postRoutes); //postRoutes
app.use("/api/notifications", notificationRoutes); //notificationRoutes

//below is the code to serve the build folder in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB(); //connect to MongoDB
});
