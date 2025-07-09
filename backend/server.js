import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config(); //help to load the environment variables from the .env file

const app = express();
const PORT = process.env.PORT || 3000; //port

app.use(express.json()); //to parse the request body, helps to access the request body
app.use(express.urlencoded({ extended: true })); //to parse the form data, helps to access the form data

app.use(cookieParser()); //to parse the cookie, helps to access the cookie

app.use("/api/auth", authRoutes); //authRoutes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB(); //connect to MongoDB
});
