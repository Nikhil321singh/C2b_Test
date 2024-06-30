import React, { useEffect, useState } from "react";
import { useAnswerContext } from "../components/AnswerContext";
import useUserProfile from "../utils/useUserProfile";
import Price from "./Price";
import axios from "axios";
import OTPpage from "./OTP_page";
import { useDispatch } from "react-redux";
import { setResponseData } from "../store/slices/responseSlice";
const InputNumber = () => {
  const [number, setNumber] = useState("");
  const { filteredAnswers } = useAnswerContext();
  const [userToken, setUserToken] = useState("");
  const [mobileId, setMobileId] = useState("");
  const [submitdata, setSubmitData] = useState({});
  const [storage, setStorage] = useState("");
  const [ram, setRAM] = useState("");
  const dispatch = useDispatch();
  const profile = useUserProfile();
  const [change, setChange] = useState(false);
  const otpVerified = true;
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    let id = localStorage.getItem("dataModel");
    id = JSON.parse(id);
    setMobileId(id?.models?._id);
    setStorage(id?.models?.config?.storage);
    setRAM(id?.models?.config?.RAM);
    setUserToken(token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else {
        try {
          const data = {
            QNA: filteredAnswers,
            phoneNumber: number,
            modelId: mobileId,
            storage: storage,
            ram: ram,
            name: profile.name,
          };
          const response = await axios.post(
            `${
              import.meta.env.VITE_REACT_APP_ENDPOINT
            }/api/questionnaires/calculatePrice`,
            data,
            {
              headers: {
                Authorization: `${userToken}`,
              },
            }
          );
          console.log("submit data", response.data);
          setSubmitData(response.data.data);

          sessionStorage.setItem("LeadId", response.data.data.id);
          sessionStorage.setItem("phoneNumber", number);
          sessionStorage.setItem(
            "responsedatadata",
            JSON.stringify(response.data.data)
          );
          dispatch(setResponseData(response.data.data));
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchData();
  }, [change, dispatch]);

  return otpVerified ? (
    <Price submitdata={submitdata} userToken={userToken} />
  ) : (
    <>
      <OTPpage
        setChange={setChange}
        change={change}
        setNumber={setNumber}
      ></OTPpage>
    </>
  );
};

export default InputNumber;
