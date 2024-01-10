import React, { useState } from "react";
import { useZxing } from "react-zxing";
import { BiSolidTorch} from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";
import styles from "../styles/Scanner.module.css";

export const Scanner = (props) => {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("steady");
  const {
    ref,
    torch: { on, off, isOn, isAvailable },
  } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
      setStatus("success");
      props.setProductName(result);
      props.scanBoxSwitch();
    },
    onDecodeError(error) {
      setStatus("error");
    },
    onError(error) {
      setStatus("error");
    },
    timeBetweenDecodingAttempts: 500,
  });

  return (
    <React.Fragment>
      <div className={`my-auto ${styles.scan_page_wrap}`}>
        <div className={"flex flex-row gap-4 w-full items-center justify-center"}>
        {!isAvailable && (
          <button className={isOn && styles.torchOn} onClick={() => (isOn ? off() : on())}>
            <BiSolidTorch size={20} className="mr-1" />
            Turn {isOn ? "Off" : "On"}
          </button>
        )}
        <button onClick={props.scanBoxSwitch}>
            <IoMdArrowRoundBack size={20} className="mr-1"/>
            Back
          </button>
        </div>
        <div
          className={`${styles.video_box} 
            ${status === "success" && "drop-shadow-[1px_10px_10px_green]"}
        `}
        >
          <video
            className={`border-2
            ${status === "steady" && "border-[#EC2752]"}
            ${status === "success" && "border-green-300"}
            ${status === "error" && "border-red-500"}`}
            ref={ref}
          />
        </div>
        <p className={"mx-5"}><span className={"text-xs font-medium"}>Last result: {result}</span></p>
      </div>
    </React.Fragment>
  );
};
