import { Link } from "react-router-dom";
import { useState } from "react";

import Xsvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    //formData for the signup form
    email: "",
    username: "",
    fullName: "",
    password: "",
  });
  const queryClient = useQueryClient(); //queryClient to invalidate the authUser query

  //below function is used to signup the user, it is a mutation function, it is a global state management for this project, it will help us to manage the state of the signup process from the backend to the frontend.
  const {
    mutate: signup, //mutate as a variable name will be used as signup for clarity
    isPending, //isPending to check if the signup is pending
    error, //error to check if the signup is failed
    isError, //isError to check if the signup is failed
  } = useMutation({
    mutationFn: async ({ email, password, fullName, username }) => {
      const response = await fetch("/api/auth/signup", {
        //hit the signup endpoint in backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, username }),
        credentials: "include",
      });

      const text = await response.text(); //get the response from the backend
      let data;
      try {
        data = JSON.parse(text); //parse the response from the backend
      } catch (err) {
        data = { message: text || "Something went wrong" }; //if the response is not a valid JSON, then set the message to the response
      }

      if (!response.ok) {
        //if the response is not ok, then throw an error
        throw new Error(data.message || "Failed to sign up"); //throw an error with the message from the backend
      }

      return data; //return the data from the backend
    },
    onSuccess: () => {
      //if success
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); //invalidate the authUser query so that the user is logged in straightaway
      toast.success("Sign up successful");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.username ||
      !formData.fullName ||
      !formData.password
    ) {
      toast.error("All fields are required");
      return;
    }
    signup(formData); //call the signup function with the form data
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); //set the form data with the new value
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <Xsvg className=" lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <Xsvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow "
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Signing up..." : "Sign up"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
