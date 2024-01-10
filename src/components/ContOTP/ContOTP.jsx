import { useState } from "react";
import styles from "./ContOTP.module.css";
import optImg from "../../assets/otpLogo.svg";
import OtpInput from "otp-input-react";

const ContOTP = (props) => {
  const [phone, setPhone] = useState("");
  const [otpBoxOpen, setOtpBoxOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const handleInputChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    let formattedValue = "+91";

    for (let i = 2; i < inputValue.length; i += 5) {
      formattedValue += " " + inputValue.slice(i, i + 5);
    }

    setPhone(formattedValue);
  };

  const continueOTPHandler = () => {
    props.setContinueOTPOpen(false);
  };
  return (
    <div className={`${styles.contopt_page} z-20`}>
      <div
        className={`${styles.optbox_wrap}`}
      >
        <div className={`${styles.optimg_wrap}`}>
          <img onClick={continueOTPHandler} src={optImg} />
        </div>
        <div
          className={`${styles.opt_heading} `}
        >
          <p className={`font-bold text-2xl`}>OTP Verificaiton</p>
          {otpBoxOpen ? (
            <span className="flex flex-col items-center justify-center text-sm opacity-60 font-medium">
              Enter OTP sent to {phone}
            </span>
          ) : (
            <span className="flex flex-col items-center justify-center text-sm opacity-60 font-medium">
              We will send you a one-time Password to this number.
            </span>
          )}
        </div>

        {otpBoxOpen ? (
          <div className={`${styles.otp_field_wrap}`}>
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
              className={styles.otp_field}
            />
          </div>
        ) : (
          <div className={`${styles.form_fields_wrap}`}>
            <div>
              <input id="name" name="name" placeholder="Enter Name" />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter Email"
              />
            </div>
            <div>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter Phone no"
                value={phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        {otpBoxOpen && (
          <div className={styles.resend_otp_wrap}>
            <div className="flex flex-row items-center justify-center text-sm font-medium">
              <span className="opacity-60">Did'nt Receive OTP?</span>
              <button className="ml-2">Resend OTP</button>
            </div>
            <div className="flex flex-row items-center justify-center text-sm font-medium">
              <span className="opacity-60">Edit Phone Number?</span>
              <button className="ml-2" onClick={() => setOtpBoxOpen(!otpBoxOpen)}>Edit Number</button>
            </div>
          </div>
        )}

        <div className={`${styles.otp_button_wrap}`}>
          {otpBoxOpen ? (
            <button>Submit</button>
          ) : (
            <button onClick={() => setOtpBoxOpen(!otpBoxOpen)}>Get OTP</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContOTP;
