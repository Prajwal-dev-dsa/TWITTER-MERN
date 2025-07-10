import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    //formData for the login form
    username: "",
    password: "",
  });

  const queryClient = useQueryClient(); //queryClient to invalidate the authUser query

  //below function is used to login the user, it is a mutation function, it is a global state management for this project, it will help us to manage the state of the login process from the backend to the frontend.
  const {
    mutate: login,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await fetch("/api/auth/login", {
        //hit the login endpoint in backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const text = await response.text(); //get the response from the backend
      let data;
      try {
        data = JSON.parse(text); //parse the response from the backend
      } catch (err) {
        data = { message: text || "Something went wrong" }; //if the response is not a valid JSON, then set the message to the response
      }
      if (!response.ok) {
        throw new Error(data.message || "Failed to login"); //throw an error with the message from the backend
      }
      return data; //return the data from the backend
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); //invalidate the authUser query so that the user is logged in straightaway
      toast.success("Login successful");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    login(formData); //call the login function with the form data
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); //set the form data with the new value
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

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
            {isPending ? "Logging in..." : "Login"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
