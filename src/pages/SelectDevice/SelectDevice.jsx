import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grest_Logo from "../../assets/Grest_Logo.jpeg";
import { FaRegUser } from "react-icons/fa";
import styles from "./SelectDevice.module.css";
import AppFooter from "../../components/AppFooter";
import User_Logo from "../../assets/User_Logo.jpeg";
const SelectDevice = () => {
  const [userName, setUserName] = useState();
  const [modelInfo, setModelInfo] = useState();
  const { brandId } = useParams();

  const navigate = useNavigate();
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);

    // const dataModel2 = JSON.parse(sessionStorage.getItem("dataModel2"));
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getSelectedBrandModels`,
        { brandId: brandId }
      )
      .then((res) => {
        console.log("asd", res.data);
        setModelInfo(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDeviceClick = (model) => {
    const data = JSON.parse(sessionStorage.getItem("dataModel"));
    const updatedData = {
      ...data,
      models: model,
    };
    sessionStorage.setItem("dataModel", JSON.stringify(updatedData));
    sessionStorage.setItem("dataModelConfig", JSON.stringify(model));
    navigate("/selectmodel");
  };
  return (
    <div className="flex flex-col bg-white pb-16">
      <div className="flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER ">
        <div className="flex items-center justify-between w-full ">
          <div className="flex ml-4 gap-2 flex-row-reverse items-center">
            <p className="mr-4 text-base  md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-28 "
            src={Grest_Logo}
            alt="app logo"
          />
        </div>
      </div>
      <div className="ml-5">
        <p className="font-bold text-2xl">Select Mobile Phone</p>
      </div>
      <div
        className={` ${styles.cardsContainer}  min-h-screen m-4  flex flex-wrap justify-center gap-2 md:gap-8 `}
      >
        {modelInfo &&
          modelInfo.map((model) => (
            <div
              key={model._id}
              className={`${styles.card} w-[30%] md:w-[20%] lg:w-[15%] xl:w-[16%]  md:rounded-lg gap-2 flex flex-col items-center px-2 py-4  text-center`}
              onClick={() => handleDeviceClick(model)}
            >
              <img
                className="w-[50px] mb-2"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmjX4AzMXjxyVKyfHZNlt877tnGHoEoDqOlA&usqp=CAU"
                alt=""
              />
              <p className="text-[11px] font-medium">{model.name}</p>
            </div>
          ))}
      </div>

      <AppFooter />
    </div>
  );
};

export default SelectDevice;
