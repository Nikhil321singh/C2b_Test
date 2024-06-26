import React, { useState } from "react";
import { RiLockPasswordLine } from "react-icons/ri";
import "../../styles/ForgetPassword.scss";
import LoadingSpinner from "../../components/LoadingSpinner";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import { MdOutlineMailLock } from "react-icons/md";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoEye } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserPassword2, setShowUserPassword2] = useState(false);
  const navigate = useNavigate();
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };
  const handleEmailChange = (event) => {
    setUserEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userEmail)) {
      toast.error("Please enter a valid email address");
    } else {
      setIsLoading(true);
      const userToken = sessionStorage.getItem("authToken");
      const data = {
        email: userEmail,
        oldPassword: password,
        newPassword: newPassword,
      };

      axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/userregistry/updatePassword`,
          data,
          {
            headers: {
              Authorization: `${userToken}`,
            },
          }
        )
        .then((res) => {
          console.log("changed", res.data.msg);
          if (res.data.msg == "Successfully updated user password ") {
            toast.success(res.data.msg);
            navigate("/");
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("failed", err);
          setIsLoading(false);
          toast.error("Failed to change password");
        });
    }
  };
  return (
    <>
      <ToastContainer />
      <div className="outer">
        <div className="absolute top-0 flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
          <div className="flex items-center justify-between w-full ">
            <ProfileBox />
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-28 "
              src={Grest_Logo}
              alt="app logo"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center box">
          <div className="imgBox">
            <img className="w-48" src={Grest_Logo} />
            <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">
              Change Password
            </h1>
            <div className="underline"></div>
          </div>
          <div className="innerbox">
            <div className="flex flex-col items-center w-full gap-6">
              <div>
                <p className="mt-5 font-bold text-center opacity-60">
                  Create new password
                </p>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full gap-6"
              >
                <input type="hidden" name="remember" value="true" />
                <div className="flex flex-col gap-6">
                  <div className="input">
                    <MdOutlineMailLock
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter Email"
                      value={userEmail}
                      onChange={handleEmailChange}
                    />
                  </div>
                  <div className="relative input">
                    <RiLockPasswordLine
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="password"
                      name="password"
                      type={showUserPassword2 ? "text" : "password"}
                      required
                      placeholder="Current Password"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <span
                      onClick={() => setShowUserPassword2(!showUserPassword2)}
                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-6"
                    >
                      {!showUserPassword2 ? <IoEyeOffSharp /> : <IoEye />}
                    </span>
                  </div>
                  <div className="relative input">
                    <RiLockPasswordLine
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showUserPassword ? "text" : "password"}
                      required
                      placeholder="New Password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                    />
                    <span
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute transform -translate-y-1/2 cursor-pointer right-2 top-6"
                    >
                      {!showUserPassword ? <IoEyeOffSharp /> : <IoEye />}
                    </span>
                  </div>
                </div>
                <div className="mb-6 login_button_holder">
                  <button
                    type="submit"
                    className={`login_button ${isLoading && "opacity-[.8]"}`}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="-ml-4 spinner">
                        <LoadingSpinner />
                      </div>
                    )}
                    {isLoading ? (
                      <span className="-ml-4">Loading</span>
                    ) : (
                      <span>Change Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
