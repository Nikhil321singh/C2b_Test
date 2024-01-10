import React, { useEffect, useState } from "react";
import "../styles/ForgetPassword.scss";
import User_Logo from "../assets/User_Logo.jpeg";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlineMailLock } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import OtpInput from "otp-input-react";
import LoadingSpinner from "../components/LoadingSpinner";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [change, setChange] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  //for sending otp to email

  const handleEmailSubmit = (event) => {
    setIsLoading(true)
    event.preventDefault();
    const data = {
      email: email,
    };

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/sendOTP`,
        data
      )
      .then((response) => {
        setStep("otp");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  //for verfiy otp
  const handleOtpSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();

    const data = {
      email: email,
      otp: otp,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/verifyEmailOtp`,
        data
      );
      setChange(2);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  //set password

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    if (password !== confirmPassword) {
      setIsLoading(false);
      alert("Passwords do not match!");
    } else {
      const data = {
        email: email,
        newPassword: password,
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/reset/Password`,
          data
        );
        console.log(response.data);
        navigate("/");
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="outer">
      <div className="flex flex-col items-center justify-center box">
        <div className="imgBox">
          <img className="w-48" src={Grest_Logo} />
          <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">
            Password Recovery
          </h1>
          <div className="underline"></div>
        </div>
        <div className="innerbox">
          {change == 1 && step === "email" ? (
            <div className="flex flex-col items-center gap-6 w-full">
              <div>
                <p className="text-center mt-5  opacity-60 font-bold">
                  Enter email to get recovery OTP
                </p>
              </div>

              <form
                className="w-full gap-6 flex flex-col"
                onSubmit={handleEmailSubmit}
              >
                <input type="hidden" name="remember" value="true" />

                <div className="">
                  <div className="input">
                    <MdOutlineMailLock
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="login_button_holder mb-6">
            <button type="submit" className={`login_button ${isLoading && "opacity-[.8]"}`} disabled={isLoading}>
              {isLoading && <div className="spinner -ml-4"><LoadingSpinner/></div>}
              {isLoading ? <span className="-ml-4">Loading</span> : <span>Get OTP</span>}
            </button>
          </div>
              </form>
            </div>
          ) : (
            change != 2 && (
              <div className="flex flex-col items-center gap-6 w-full">
                <div>
                  <p className="text-center mt-5  opacity-60 font-bold">
                    Enter OTP to verify email address
                  </p>
                </div>
                <form
                  className="w-full gap-6 flex flex-col"
                  onSubmit={handleOtpSubmit}
                >
                  <input type="hidden" name="remember" value="true" />
                  <div className="">
                    <div className="flex flex-col items-center ml-3">
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        OTPLength={6}
                        otpType="number"
                        disabled={false}
                        autoFocus
                        inputStyles={{
                          border: "2px solid #EC2752",
                          borderRadius: ".55rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div className="login_button_holder mb-6">
            <button type="submit" className={`login_button ${isLoading && "opacity-[.8]"}`} disabled={isLoading}>
              {isLoading && <div className="spinner -ml-4"><LoadingSpinner/></div>}
              {isLoading ? <span className="-ml-4">Loading</span> : <span>Verify Email</span>}
            </button>
          </div>
                </form>
              </div>
            )
          )}

          {change == 2 && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div>
                <p className="text-center mt-5  opacity-60 font-bold">
                  Create new password
                </p>
              </div>
              <form
                onSubmit={handleSubmit}
                className="w-full gap-6 flex flex-col"
              >
                <input type="hidden" name="remember" value="true" />
                <div className="flex flex-col gap-6">
                  <div className="input">
                    <RiLockPasswordLine
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="New Password"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="input">
                    <RiLockPasswordLine
                      size={25}
                      style={{ margin: "0px 10px", color: "#EC2752" }}
                    />
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                  </div>
                </div>
                <div className="login_button_holder mb-6">
            <button type="submit" className={`login_button ${isLoading && "opacity-[.8]"}`} disabled={isLoading}>
              {isLoading && <div className="spinner -ml-4"><LoadingSpinner/></div>}
              {isLoading ? <span className="-ml-4">Loading</span> : <span>Change Password</span>}
            </button>
          </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
