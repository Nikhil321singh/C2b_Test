import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/userSlice";

const AdminLogin = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  const userLogin = () => {
    setError(null);
    axios
      .post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/login`, {
        email: userEmail,
        password: userPassword,
      })
      .then((response) => {
        const { profile, authToken } = response.data;
        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("profile", JSON.stringify(profile));
        localStorage.removeItem("formData");
        dispatch(setUserProfile(profile));
        navigate("/adminhome");
      })
      .catch((err) => {
        setError(
          err.response?.data?.error || "Please enter correct login credentials"
        );
      });
  };

  return (
    <div className="flex items-center justify-center bg-white min-h-screen ">
      <div className="p-10 rounded-lg md:w-[720px] flex flex-col items-center ">
        <img className="w-48" src={Grest_Logo} alt="app logo" />
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Admin Login</h1>
        {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
        <form id="loginForm" className="flex flex-col gap-4">
          <div>
            <label htmlFor="userEmail" className="block text-lg">
              Email:
            </label>
            <input
              type="text"
              id="userEmail"
              name="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="block w-72 sm:w-[400px] md:w-[470px] sm:h-14 h-12 border rounded-lg focus:ring focus:ring-[#EC2752] focus:outline-none pl-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              className="block w-72 sm:w-[400px] md:w-[470px] sm:h-14 h-12 border rounded-lg focus:ring focus:ring-[#EC2752] focus:outline-none pl-2"
            />
          </div>
          <Link to="/">
            <button
              onClick={userLogin}
              type="button"
              className="block w-72 sm:w-[400px] md:w-[470px] sm:h-14  h-12 bg-[#EC2752] text-white rounded-lg mt-1"
            >
              Login
            </button>
          </Link>

          {/* <span>
            Create a new account.{" "}
            <Link className="cursor-pointer text-[#EC2752]" to="/register">
              Register
            </Link>{" "}
          </span> */}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
