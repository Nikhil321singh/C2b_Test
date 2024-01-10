import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/userSlice";
import "../styles/login.scss";
import { SocialIcon } from "react-social-icons";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdOutlineMailLock } from "react-icons/md";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  const userLogin = () => {
    setIsLoading(true);
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
        // sessionStorage.removeItem("otpverified");
        dispatch(setUserProfile(profile));
        // navigate("/selectPhone");
        navigate("/SelectDeviceType");
      })
      .catch((err) => {
        setIsLoading(false);
        setError(
          err.response?.data?.error || "Please enter correct login credentials"
        );
        
      });
  };

  const handleClick = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white Container">
      <div className="flex flex-col items-center justify-center px-10 pb-4 secondContainer">
        <img className="w-48" src={Grest_Logo} alt="app logo" />
        <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Sign in</h1>
        <div className="underline"></div>
        {error && <p className="text-sm text-red-500 sm:text-base">{error}</p>}
        <div id="loginForm" className="flex flex-col gap-4 w-[32vw] formOuter">
          <div>
            <label htmlFor="userEmail">Email</label>
            <div className="input">
            <MdOutlineMailLock size={25} style={{ margin: "0px 10px", color: "#EC2752" }}/>
            <input
              type="text"
              id="userEmail"
              name="userEmail"
              placeholder="Enter email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
            />
          </div>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div className="input">
            <RiLockPasswordLine size={25} style={{ margin: "0px 10px", color: "#EC2752" }}/>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              required
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              className="relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
            />
          </div>
          </div>
          
          
          <Link to="/PasswordRecovery">
            <span className="text-right text-sm font-medium block text-[rgb(236,39,82)] forgetpass">
              Forget Password?
            </span>
          </Link>
          <Link to="/" className="login_button_holder">
            <button onClick={userLogin} type="button" className={`login_button ${isLoading && "opacity-[.9]"}`} disabled={isLoading}>
              {isLoading && <div className="spinner"><LoadingSpinner/></div>}
              {isLoading ? <span className="-ml-4">Loading</span> : <span>Login</span>}
            </button>
          </Link>
          

          {/* <span>
            Create a new account.{" "}
            <Link className="cursor-pointer text-[#EC2752]" to="/register">
              Register
            </Link>{" "}
          </span> */}
        </div>

        <div className="mediaicon">
          <span>or sign up using</span>
          <div className="list">
            <SocialIcon
              className="my-icon"
              url="https://twitter.com"
              bgColor="#1DA1F2"
              onClick={handleClick}
            />
            <SocialIcon
              className="my-icon"
              url="https://www.facebook.com"
              onClick={handleClick}
            />
            <SocialIcon
              className="my-icon"
              url="https://www.instagram.com"
              onClick={handleClick}
            />
            <SocialIcon
              className="my-icon"
              network="mailto"
              onClick={handleClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
