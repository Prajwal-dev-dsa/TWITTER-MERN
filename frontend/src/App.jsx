import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"], //queryKey for the authUser query
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        //hit the me endpoint in backend
        credentials: "include", //mandatory to send the cookies to the backend
      });

      if (res.status === 401) return null; //if the response is not ok, then return null

      const data = await res.json(); //get the response from the backend

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong"); //if the response is not ok, then throw an error
      }

      return data; //return the data from the backend
    },
    retry: false, //don't retry if the query fails
  });
  console.log("user from query:", user);

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size={"lg"} />
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      {/* if user is authenticated or not, show there respective fields */}
      {user && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUpPage />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/notifications"
          element={user ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {user && <RightPanel />}
      <Toaster />
    </div>
  );
}
export default App;
