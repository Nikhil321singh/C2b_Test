import React, { useEffect, useState } from "react";
import { RiLockPasswordLine } from "react-icons/ri";
import "../../styles/ForgetPassword.scss";
import LoadingSpinner from "../../components/LoadingSpinner";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import { MdOutlineMailLock } from "react-icons/md";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoEye, IoEyeOffSharp } from "react-icons/io5";
import userSlice from "../../store/slices/userSlice";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [newFocus, setNewFocus] = useState(false);
  const [confFocus, setConfFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(true);
  const [showUserPassword2, setShowUserPassword2] = useState(false);
  const [errMsg, setErrMsg] = useState("");
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

  const passwordValidation = () => {
    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const lCaseRegex = /[a-z]/;
    const uCaseRegex = /[A-Z]/;
    const numRegex = /\d/;
    const spCharRegex = /[@$!%*?&]/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(userEmail)) {
      setErrMsg("Please Enter a Valid Email");
      setIsValid(false);
      return;
    } else {
      setErrMsg("");
    }

    if (password.length < 8) {
      setErrMsg("Password Size Must Be More Than 8 Characters");
      setIsValid(false);
      return;
    } else {
      setErrMsg("");
    }

    if (newPassword.length < 8) {
      setErrMsg("Password Size Must Be More Than 8 Characters");
      setIsValid(false);
      return;
    }
    if (!lCaseRegex.test(newPassword) && newFocus) {
      setErrMsg("Password Must Contain a Lower Case Letter");
      setIsValid(false);
      return;
    }
    if (!uCaseRegex.test(newPassword) && newFocus) {
      setErrMsg("Password Must Contain a Upper Case Letter");
      setIsValid(false);
      return;
    }
    if (!numRegex.test(newPassword) && newFocus) {
      setErrMsg("Password Must Contain a Number");
      setIsValid(false);
      return;
    }
    if (!spCharRegex.test(newPassword) && newFocus) {
      setErrMsg("Password Must Contain a Speacial Char [@$!%*?&]");
      return;
    }
    if (newPassword !== confPassword) {
      setErrMsg("Confirm Password Does'nt Match");
      setIsValid(false);
      return;
    }
    if (
      newPassword === confPassword &&
      newPassword.length >= 8 &&
      lCaseRegex.test(newPassword) &&
      uCaseRegex.test(newPassword) &&
      numRegex.test(newPassword) &&
      spCharRegex.test(newPassword)
    ) {
      setIsValid(true);
      setErrMsg("Password Matched Please Submit");
      return;
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => {
    passwordValidation();
    console.log(isValid);
  }, [userEmail, newPassword, confPassword, newFocus, confFocus]);

  const showPop = () => {
    if (newPassword != confPassword) setShowPopup(true);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    showPop();
    setIsLoading(true);
    const userToken = sessionStorage.getItem("authToken");
    const data = {
      email: userEmail,
      oldPassword: password,
      newPassword: newPassword,
    };

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT
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
        if (res.data.msg === "Successfully updated user password ") {
          setErrMsg("Successfully Updated User Password");
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("failed", err);
        setIsLoading(false);
        setErrMsg("Failed to Change Password");
      });
  };
  return (
    <>
      <div className="outer">
        <div className="absolute top-0 flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER ">
          <div className="flex items-center justify-between w-full ">
            <ProfileBox />
            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-40"
              src={Grest_Logo}
              alt="app logo"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full mt-16">
          <div className={`w-[85vw] h-[160px] popup py-0 ${showPopup ? "show" : ""}`}>
            <div className="text">New Password & Confirm Password must be same</div>
            <button onClick={() => setShowPopup(false)}> Close</button>
          </div>
          <div className="flex flex-col items-center justify-center box">
            <div className="imgBox">
              <img className="w-48 pt-4 mt-2 mb-3" src={Grest_Logo} />
              <h1 className="font-sans text-[#4900A8] my-2 text-3xl font-bold sm:text-4xl">
                Change Password
              </h1>
              <p
                className={`${
                  isValid ? "text-[#8080FF]" : "text-[#8080FF]"
                } text-sm h-[20px]`}
              >
                {errMsg}
              </p>
            </div>
            <div className="innerbox">
              <div className="flex flex-col items-center w-full gap-6">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col w-full gap-6"
                >
                  <input type="hidden" name="remember" value="true" />
                  <div className="flex flex-col gap-4">
                    <div className="input">
                      <MdOutlineMailLock
                        size={25}
                        style={{ margin: "0px 10px", color: "#4900A8" }}
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
                        style={{ margin: "0px 10px", color: "#4900A8" }}
                      />
                      <input
                        id="password"
                        name="password"
                        type={showUserPassword2 ? "text" : "password"}
                        required
                        minLength={8}
                        maxLength={20}
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
                        style={{ margin: "0px 10px", color: "#4900A8" }}
                      />
                      <input
                        id="new-password"
                        name="newPassword"
                        type={showUserPassword ? "text" : "new-password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={20}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        onFocus={() => setNewFocus(true)}
                        onBlur={() => setNewFocus(false)}
                      />
                    </div>
                    <div className="relative input">
                      <RiLockPasswordLine
                        size={25}
                        style={{ margin: "0px 10px", color: "#4900A8" }}
                      />
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showUserPassword ? "text" : "new-password"}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={20}
                        required
                        placeholder="Confirm Password"
                        value={confPassword}
                        onChange={(e) => setConfPassword(e.target.value)}
                        onFocus={() => setConfFocus(true)}
                        onBlur={() => setConfFocus(false)}
                      />
                    </div>
                  </div>
                  <div className="mb-6 login_button_holder">
                    <button
                      type="submit"
                      className={`login_button ${
                        (isLoading || !isValid) && "opacity-[.8]"
                      }`}
                      disabled={isLoading || !isValid}
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
      </div>
    </>
  );
};

export default ChangePassword;
