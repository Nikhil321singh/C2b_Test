import { useState } from "react";
import downArrow from "../assets/down.png";
import { useEffect } from "react";
import axios from "axios";
import useUserProfile from "../utils/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../components/dataContext";
import { useSelector, useDispatch } from "react-redux";
import { useQuestionContext } from "../components/QuestionContext";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

export default function Test() {
  const [selectedPhone, setselectedPhone] = useState(null);
  const [data, setData] = useState([]);
  const [selectedphone, setSelectedphone] = useState(null);
  const { dataModel, setdataModel } = useDataContext();
  const { answers, setAnswers } = useQuestionContext();
  const [modelArrow, setModelArrow] = useState([]);
  const [brandArrows, setBrandArrows] = useState(Array(data.length).fill(true));
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useUserProfile();

  function handlebrandClick(index) {
    const len = data[index].models.length;
    setModelArrow(Array(len).fill(true));

    const updatedBrandArrows = [...brandArrows];
    updatedBrandArrows[index] = !updatedBrandArrows[index];
    setBrandArrows(updatedBrandArrows);

    if (selectedPhone === index) {
      setselectedPhone(null);
    } else {
      setselectedPhone(index);
    }

    const shallowCopy = { ...data[index] };

    setdataModel(shallowCopy);
  }

  function handlemodel(index) {
    const updateModelArrows = [...modelArrow];
    updateModelArrows[index] = !updateModelArrows[index];
    setModelArrow(updateModelArrows);

    if (selectedphone === index) {
      setSelectedphone(null);
    } else {
      setSelectedphone(index);
    }

    const updatedDataModel = { ...dataModel };

    // console.log("updated model", data[selectedPhone].models[index]);
    sessionStorage.setItem(
      "brandSelected",
      JSON.stringify(data[selectedPhone].models[index])
    );
    updatedDataModel.models = data[selectedPhone].models[index];
    setdataModel(updatedDataModel);
  }

  // where we fetch data
  function handleData(index) {
    const updatedDataModel = { ...dataModel };

    updatedDataModel.models.config =
      data[selectedPhone].models[selectedphone].config[index];
    setdataModel(updatedDataModel);
    localStorage.setItem("dataModel", JSON.stringify(dataModel));

    setAnswers([]);
    Navigate("/devicedetail");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getAllBrandsModels`;

        const response = await axios.get(apiUrl);
        setData(response.data.data);
        console.log("mobile data", response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-auto MAIN_CONTAINER max-h-screen-4">
      <div className="flex items-center w-screen py-4 h-24 bg-white">
        <div className="flex items-center justify-between w-full ">
          <span className="w-4/5 text-xl md:text-3xl ml-4">
            Select Brand/Model
          </span>
          <img className="w-36 sm:w-40" src={Grest_Logo} alt="" />
        </div>
      </div>

      <div></div>

      <div className="relative w-screen md:w-[80%] md:mx-auto h-screen  LIST_MODELS max-h-screen-4 ">
        {data.map((data, index) => (
          <div
            key={data.brand._id}
            className="relative flex flex-col h-auto mx-6  model mt-7"
          >
            <div
              className={`flex  items-center justify-between p-3  bg-white rounded-lg  h-21 px-22 model  ${
                selectedPhone === index ? "bg-blue-300 " : ""
              }  `}
              onClick={() => {
                handlebrandClick(index);
              }}
            >
              <img src={data.brand.logo} alt="logo" className="w-24 h-12" />

              {!brandArrows[index] ? (
                <RiArrowDownSLine size={30} />
              ) : (
                <RiArrowUpSLine size={30} />
              )}
              {/* <p className="text-2xl ">{data.brand.name}</p> */}
            </div>
            {selectedPhone === index && (
              <div className=" z-10 flex flex-col items-center justify-between h-21 px-22 top-20 text-xl md:text-3xl">
                {data.models.map((data, index) => (
                  <div
                    key={data._id}
                    className="flex flex-col items-center justify-between w-full p-3 gap-2 bg-white border-t-2 rounded h-21 px-22"
                  >
                    <div
                      onClick={() => {
                        handlemodel(index);
                      }}
                      className="flex items-center justify-between w-11/12 "
                    >
                      <p className="">{data.name}</p>
                      {/* <img
                        src={downArrow}
                        alt="arrow"
                        className="h-5 w-12.5 transform "
                        onClick={() => {
                          handlemodel(index);
                        }}
                      /> */}
                      {modelArrow[index] ? (
                        <RiArrowDownSLine size={30} />
                      ) : (
                        <RiArrowUpSLine size={30} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-11/12 justify-between">
                      {selectedphone === index &&
                        data.config.map((option, index) => (
                          <div
                            key={index}
                            className="flex  items-center"
                            onClick={() => {
                              handleData(index);
                            }}
                          >
                            <input
                              type="radio"
                              name="storage "
                              value={option.storage}
                              id={index}
                              className="w-4 sm:w-5 h-5 border rounded-full outline-none "
                            />
                            <label
                              htmlFor={index}
                              className="cursor-pointer ml-1 sm:ml-3 text-xl sm:text-xl md:text-3x"
                            >
                              {/* uncomment */}
                              {option.RAM}/{option.storage}
                              {/* {option.storage} */}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
