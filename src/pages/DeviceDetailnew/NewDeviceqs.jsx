import { useEffect, useReducer, useState } from "react";
import "./newDeviceqs.scss";
import { useQuestionContext } from "../../components/QuestionContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import store from "../../store/store";
import User_Logo from "../../assets/User_Logo.jpeg";
import Grest_Logo from "../../assets/Grest_Logo.jpeg";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import banner from "../../assets/banner.jpg";
import { GoDotFill } from "react-icons/go";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
// The file where your store is defined
import {
  setGroupAnswers,
  updateCoreObject,
  updateCosmeticsObject,
  updateDisplayObject,
  updateFunctionalMajorObject,
  updateFunctionalMinorObject,
  updateWarrantyObject,
} from "../../store/slices/QNAslice";
import styles from "../SelectDeviceType/SelectDeviceType.module.css";
import { CiSearch } from "react-icons/ci";
import { setResponseData } from "../../store/slices/responseSlice";
import useUserProfile from "../../utils/useUserProfile";
import { BsArrowRight } from "react-icons/bs";

function NewDeviceqs() {
  const initialState = {
    Core: [],
    Cosmetics: [],
    Display: [],
    Functional_major: [],
    Functional_minor: [],
    Warranty: [],
  };
  const [dataModel, setDataModel] = useState({});
  const [userName, setUserName] = useState();
  const [questions, setQuestions] = useState([]);
  const { answers, setAnswers } = useQuestionContext();
  const [visible, setVisible] = useState(1);
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState("");
  const profile = useUserProfile();

  //geting anser from redux
  const core = useSelector((state) => state.qna.Core);
  const Cosmetics = useSelector((state) => state.qna.Cosmetics);

  const Display = useSelector((state) => state.qna.Display);
  const Functional_major = useSelector((state) => state.qna.Functional_major);
  const Functional_minor = useSelector((state) => state.qna.Functional_minor);
  const Warranty = useSelector((state) => state.qna.Warranty);
  const [showPopup, setShowPopup] = useState(true);

  function reducer(state, action) {
    switch (action.type) {
      case "SET_GROUP_ANSWERS":
        return { ...state, [action.group]: action.answers };
      default:
        throw new Error();
    }
  }

  //intilize reducer
  const [state, dispatch] = useReducer(reducer, initialState);

  //call for question from
  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(LoggedInUser?.name);
    const fetchData = async () => {
      try {
        const apiUrl = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/findAll?page=0&limit=31`;

        const response = await axios.get(apiUrl);

        //test
        [
          "Core",
          "Cosmetics",
          "Display",
          "Functional_major",
          "Functional_minor",
          "Warranty",
        ].forEach((group) => {
          const answers = response.data.data.filter(
            (question) => question.group === group
          );

          dispatch({ type: "SET_GROUP_ANSWERS", group, answers });
        });

        setQuestions(response.data.data);
        const newPopulateAnswers = response.data.data.map((ele) => ele.default);

        if (answers.length === 0) {
          const newAnswers = newPopulateAnswers.map((answer, index) => {
            return {
              quetion: response.data.data[index].quetion,
              answer,
              key: response.data.data[index].yes === answer ? "yes" : "no",
              group: response.data.data[index].group,
            };
          });

          setAnswers(newAnswers);

          [
            "Core",
            "Cosmetics",
            "Display",
            "Functional_major",
            "Functional_minor",
            "Warranty",
          ].forEach((group) => {
            const answers = newAnswers.filter(
              (question) => question.group === group
            );
            store.dispatch(setGroupAnswers({ group, answers }));
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const data = localStorage.getItem("dataModel");
    setDataModel(JSON.parse(data));
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, []);

  // console.log(state.Core);

  function handleADD() {
    setVisible(visible + 1);
  }

  function handleSubtract() {
    setVisible(visible - 1);
  }

  //seting data in reduc

  const handleChange = (event, questionIndex, group, key) => {
    const { value } = event.target;

    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = {
      quetion: questions[questionIndex].quetion,
      answer: value,
      key,
      group,
    };

    setAnswers(updatedAnswers);
  };

  const handlepop = () => {
    setShowPopup(false);
  };

  const qna = useSelector((state) => state.qna);

  const handlesubmit = async () => {
    const token = sessionStorage.getItem("authToken");
    setUserToken(token);
    console.log("tokennnnnnnnn", token);
    const phoneNumber = sessionStorage.getItem("phoneNumber");
    let id = localStorage.getItem("dataModel");
    id = JSON.parse(id);

    navigate("/devicequote");
    
    const finalPayload = {
      QNA: qna,
      phoneNumber: phoneNumber,
      modelId: id?.models?._id,
      storage: id?.models?.config?.storage,
      ram: id?.models?.config?.RAM,
      name: profile?.name,
    };
    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/calculatePrice`,
      finalPayload,
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );
    // console.log("submit data", response.data);

    sessionStorage.setItem("LeadId", response.data.data.id);
    sessionStorage.setItem(
      "responsedatadata",
      JSON.stringify(response.data.data)
    );
    dispatch(setResponseData(response.data.data));
    console.log("clicked");

    navigate("/devicequote");
  };

  return (
    <>
      <div className={`popup ${showPopup ? "show" : ""}`}>
        <img src={banner} alt="banner" />

        <div className="text">
          Help us calculate your device value correctly by answering to the
          following questions
        </div>

        <button onClick={handlepop}> Got it</button> 
      </div>

      <div className="mainQContainer">
        <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER header">
          <div className="flex items-center justify-between w-full ">
            <div className="flex flex-row-reverse items-center gap-2 ml-4">
              <p className="mr-4 text-base md:text-xl">{userName}</p>

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

        <div className={`${styles.search_box_wrap} mt-[15px]`}>
          <div
            className={`flex items-center bg-gray-200  p-2 mb-1 rounded-lg w-[100%] ${styles.search_box}`}
          >
            <div className="flex items-center">
              <CiSearch size={20} className="inline ml-1" />
            </div>
            <input
              placeholder="Search Question"
              className="inline w-full mx-2 bg-gray-200 outline-none"
              type="text"
            />
          </div>
        </div>
        
        {(visible >1 && visible <=6) && <div className="back" onClick={handleSubtract}>
        <MdOutlineKeyboardBackspace  size={35}/>

        </div>}

        <div className="innerContainer">
          <div className="maindata">
            <div className="heading">Tell us more about your device?</div>
            <div className="underline"></div>
            <div className="questionList">
              {visible == 1 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={15} />
                    <h2>Basic Condition of the Device</h2>
                  </div>

                  {state.Core &&
                    state.Core.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              core[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                store.dispatch(
                                  updateCoreObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={core[index].answer === data.yes}
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              core[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                store.dispatch(
                                  updateCoreObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={core[index].answer === data.no}
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="firstcontain">
                    <button onClick={handleADD}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Continue</div>
                    </button>
                  </div> */}

                  {/* <div className="fixed bottom-0 w-full   h-[75px] ">
                    <div className="flex items-center gap-2 text-white bg-[#EC2752] p-3 justify-center h-[75px]">
                      <button className="font-bold">"Continue"</button>

                      <BsArrowRight size={23} />
                    </div>
                  </div> */}
                </div>
              )}

              {/* //for cosmetics */}
              {visible == 2 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={20} />
                    <h2>Physical Condition of the Screen</h2>
                  </div>
                  {state.Cosmetics &&
                    state.Cosmetics.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Cosmetics[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "yes")
                                store.dispatch(
                                  updateCosmeticsObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={Cosmetics[index].answer === data.yes}
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Cosmetics[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "no")
                                store.dispatch(
                                  updateCosmeticsObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={Cosmetics[index].answer === data.no}
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="containButton">
                    <button onClick={handleSubtract}>
                      <FaArrowLeft color="black" className="svg" />
                      <div className="text">Back</div>
                    </button>

                    <button onClick={handleADD}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Continue</div>
                    </button>
                  </div> */}
                </div>
              )}

              {/* //for display */}

              {visible == 3 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={20} />
                    <h2>Display Condition of the Device</h2>
                  </div>
                  {state.Display &&
                    state.Display.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Display[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "yes")
                                store.dispatch(
                                  updateDisplayObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={Display[index].answer === data.yes}
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Display[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "no")
                                store.dispatch(
                                  updateDisplayObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={Display[index].answer === data.no}
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="containButton">
                    <button onClick={handleSubtract}>
                      <FaArrowLeft color="black" className="svg" />
                      <div className="text">Back</div>
                    </button>

                    <button onClick={handleADD}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Continue</div>
                    </button>
                  </div> */}
                </div>
              )}

              {/* //Functional_major*/}

              {visible == 4 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={20} />
                    <h2>Functional Condition of the Device</h2>
                  </div>
                  {state.Functional_major &&
                    state.Functional_major.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Functional_major[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                store.dispatch(
                                  updateFunctionalMajorObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={
                                Functional_major[index].answer === data.yes
                              }
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Functional_major[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                store.dispatch(
                                  updateFunctionalMajorObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={
                                Functional_major[index].answer === data.no
                              }
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="containButton">
                    <button onClick={handleSubtract}>
                      <FaArrowLeft color="black" className="svg" />
                      <div className="text">Back</div>
                    </button>

                    <button onClick={handleADD}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Continue</div>
                    </button>
                  </div> */}
                </div>
              )}

              {/* //for Functional_minor */}
              {visible == 5 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={20} />
                    <h2>Functional Condition of the Device</h2>
                  </div>
                  {state.Functional_minor &&
                    state.Functional_minor.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Functional_minor[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "yes")
                                store.dispatch(
                                  updateFunctionalMinorObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={
                                Functional_minor[index].answer === data.yes
                              }
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Functional_minor[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "no")
                                store.dispatch(
                                  updateFunctionalMinorObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={
                                Functional_minor[index].answer === data.no
                              }
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="containButton">
                    <button onClick={handleSubtract}>
                      <FaArrowLeft color="black" className="svg" />
                      <div className="text">Back</div>
                    </button>

                    <button onClick={handleADD}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Continue</div>
                    </button>
                  </div> */}
                </div>
              )}

              {/* //fro Warranty */}
              {visible == 6 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={20} />
                    <h2>Basic Condition of the Device</h2>
                  </div>
                  {state.Warranty &&
                    state.Warranty.map((data, index) => (
                      <div
                        className="flex flex-col gap-4 mb-4 one"
                        key={data._id}
                      >
                        <div className="flex gap-1 two">
                          <p className="text-xl">{index + 1}.</p>
                          <p className="text-xl three">{data.quetion}</p>
                        </div>
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                          <label
                            className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Warranty[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.yes}
                              onChange={(e) => {
                                // handleChange(e, index, data.group, "yes")
                                store.dispatch(
                                  updateWarrantyObject({
                                    index: index,
                                    newAnswer: data.yes,
                                    newKey: "yes",
                                  })
                                );
                              }}
                              checked={Warranty[index].answer === data.yes}
                            />{" "}
                            Yes
                          </label>
                          <label
                            className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                              Warranty[index].answer === data.no
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              name={data._id}
                              type="radio"
                              value={data.no}
                              onChange={(e) => {
                                store.dispatch(
                                  updateWarrantyObject({
                                    index: index,
                                    newAnswer: data.no,
                                    newKey: "no",
                                  })
                                );
                              }}
                              checked={Warranty[index].answer === data.no}
                            />{" "}
                            No
                          </label>
                        </div>
                        <div className="border-b-2 opacity-10 border-[#595555] max-w-[80%]"></div>
                      </div>
                    ))}

                  {/* <div className="containButton">
                    <button onClick={handleSubtract}>
                      <FaArrowLeft color="black" className="svg" />
                      <div className="text">Back</div>
                    </button>

                    <button onClick={handlesubmit}>
                      <FaArrowRight color="black" className="svg" />
                      <div className="text">Submit</div>
                    </button>
                  </div> */}
                </div>
              )}
            </div>
           
          </div>
        
        </div>
        {(visible >= 6 )?<div className="fixed bottom-0 w-full   h-[75px] ">
                    <div className="flex items-center gap-2 text-white bg-[#EC2752] p-3 justify-center h-[75px]" onClick={handlesubmit}>
                      <button className="font-bold">
                       Sumbit</button>

                      <BsArrowRight size={23} />
                    </div>
                  </div>:<div className="fixed bottom-0 w-full   h-[75px] ">
                    <div className="flex items-center gap-2 text-white bg-[#EC2752] p-3 justify-center h-[75px]"  onClick={handleADD}>
                      <button className="font-bold">
                    Continue</button>

                      <BsArrowRight size={23} />
                    </div>
                  </div>}
      </div>
    </>
  );
}

export default NewDeviceqs;
