import React, { useEffect, useReducer, useState } from "react";
import "./newDeviceqs.scss";
import { useQuestionContext } from "../../components/QuestionContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImArrowLeft } from "react-icons/im";
import store from "../../store/store";
import User_Logo from "../../assets/User_Logo.jpg";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import banner from "../../assets/banner.jpg";
import { GoDotFill } from "react-icons/go";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
// The file where your store is defined

// import quesImg1 from "../../assets/quesImg0.png";
import quesImg1 from "../../assets/5.jpg";
import quesImg2 from "../../assets/20.jpg";
import quesImg3 from "../../assets/8.jpg";
import quesImg4 from "../../assets/6.jpg";
import quesImg5 from "../../assets/7.jpg";
import quesImg6 from "../../assets/39.jpg";
import quesImg7 from "../../assets/41.jpg";
import quesImg8 from "../../assets/42.jpg";
import quesImg9 from "../../assets/40.jpg";
import quesImg10 from "../../assets/44.jpg";
import quesImg11 from "../../assets/37.jpg";
import quesImg12 from "../../assets/38.jpg";
import quesImg13 from "../../assets/43.jpg";
import quesImg14 from "../../assets/45.jpg";
import quesImg15 from "../../assets/35.jpg";
import quesImg16 from "../../assets/36.jpg";
import quesImg17 from "../../assets/10.jpg";
import quesImg18 from "../../assets/11.jpg";
import quesImg19 from "../../assets/9.jpg";
import quesImg20 from "../../assets/12.jpg";
import quesImg21 from "../../assets/13.jpg";
import quesImg22 from "../../assets/14.jpg";
import quesImg23 from "../../assets/17.jpg";
import quesImg24 from "../../assets/47.png";
import quesImg25 from "../../assets/46.png";
import quesImg26 from "../../assets/18.jpg";
import quesImg27 from "../../assets/19.jpg";
import quesImg28 from "../../assets/20.jpg";
import quesImg29 from "../../assets/21.jpg";
import quesImg30 from "../../assets/22.jpg";
import quesImg31 from "../../assets/24.jpg";
import quesImg32 from "../../assets/23.jpg";
import quesImg33 from "../../assets/25.jpg";
import quesImg34 from "../../assets/26.jpg";
import quesImg35 from "../../assets/27.jpg";
import quesImg36 from "../../assets/29.jpg";
import quesImg37 from "../../assets/24.jpg";
import quesImg38 from "../../assets/9.jpg";
import quesImg39 from "../../assets/28.jpg";
import quesImg40 from "../../assets/27.jpg";
import quesImg41 from "../../assets/29.jpg";
import quesImg42 from "../../assets/30.jpg";
import quesImg43 from "../../assets/32.jpg";
import quesImg44 from "../../assets/31.jpg";
import quesImg45 from "../../assets/33.jpg";
import quesImg46 from "../../assets/34.jpg";
import quesImg47 from "../../assets/1.jpg";
import quesImg48 from "../../assets/2.jpg";
import quesImg49 from "../../assets/3.jpg";
import quesImg50 from "../../assets/4.jpg";
import quesImg51 from "../../assets/quesImg0.png";
import quesImg52 from "../../assets/quesImg0.png";

const imageMap = {
  quesImg1,
  quesImg2,
  quesImg3,
  quesImg4,
  quesImg5,
  quesImg6,
  quesImg7,
  quesImg8,
  quesImg9,
  quesImg10,
  quesImg11,
  quesImg12,
  quesImg13,
  quesImg14,
  quesImg15,
  quesImg16,
  quesImg17,
  quesImg18,
  quesImg19,
  quesImg20,
  quesImg21,
  quesImg22,
  quesImg23,
  quesImg24,
  quesImg25,
  quesImg26,
  quesImg27,
  quesImg28,
  quesImg29,
  quesImg30,
  quesImg31,
  quesImg32,
  quesImg33,
  quesImg34,
  quesImg35,
  quesImg36,
  quesImg37,
  quesImg38,
  quesImg39,
  quesImg40,
  quesImg41,
  quesImg42,
  quesImg43,
  quesImg44,
  quesImg45,
  quesImg46,
  quesImg47,
  quesImg48,
  quesImg49,
  quesImg50,
  quesImg51,
  quesImg52,
};

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
import { CgSpinner } from "react-icons/cg";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { IoIosArrowBack } from "react-icons/io";
import styless from "../QuickQuote/QuickQuote.module.css";
import QuestionSearch from "../../components/QuestionSearch/QuestionSearch";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userName, setUserName] = useState();
  const [questions, setQuestions] = useState([]);
  const { answers, setAnswers } = useQuestionContext();
  const [visible, setVisible] = useState(1);
  const [newGroupanswers, setNewGroupAnswers] = useState();
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
  const [isLoading, setIsLoading] = useState(false);
  // const [warrantySelect,setWarantySelect]=useState("1")

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
    const userToken = sessionStorage.getItem("authToken");
    setUserName(LoggedInUser?.name);
    const fetchData = async () => {
      try {
        const apiUrl = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/findAll?page=0&limit=31`;

        const response = await axios.get(apiUrl, {
          headers: {
            authorization: `${userToken}`,
          },
        });

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
            if (response.data.data[index].yes === answer) {
              return {
                quetion: response.data.data[index].quetion,
                answer,
                key: response.data.data[index].yes === answer ? "yes" : "no",
                group: response.data.data[index].group,
                selected: Array(response.data.data[index].options.length).fill(
                  true
                ),
              };
            } else {
              return {
                quetion: response.data.data[index].quetion,
                answer,
                key: response.data.data[index].yes === answer ? "yes" : "no",
                group: response.data.data[index].group,
                selected: Array(response.data.data[index].options.length).fill(
                  false
                ),
              };
            }
          });

          setAnswers(newAnswers);
          setNewGroupAnswers(newAnswers);

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
            console.log(answers);
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
    if (showPopup === false) {
      setVisible(visible + 1);
    }
  }

  function handleSubtract() {
    if (visible > 1) {
      setVisible(visible - 1);
    }
    return;
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
    setIsLoading(true);
    const token = sessionStorage.getItem("authToken");
    setUserToken(token);
    // console.log("tokennnnnnnnn", token);
    const phoneNumber = sessionStorage.getItem("phoneNumber");
    let id = sessionStorage.getItem("dataModel");
    id = JSON.parse(id);
    console.log("vore", state.Core);
    console.log("vore", qna.Core);
    const finalPayload = {
      QNA: qna,
      phoneNumber: id?.phoneNumber ? id?.phoneNumber : "123456789",
      modelId: id?.models?._id,
      storage: id?.models?.config?.storage,
      ram: id?.models?.config?.RAM,

      name: id?.customerName ? id?.customerName : profile?.name,
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
    sessionStorage.setItem("ExactQuote", true);
    store.dispatch(setResponseData(response.data.data));
    // console.log("clicked");
    setIsLoading(false);
    navigate("/devicequote");
  };

  const backHandler = () => {
    navigate("/selectmodel");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [visible]);

  const updateAns = (group) => {
    let answers = newGroupanswers.filter(
      (question) => question.group === group
    );

    store.dispatch(setGroupAnswers({ group, answers }));

    if (showPopup === false) {
      setVisible(visible + 1);
    }
  };

  const handleSkip = () => {
    switch (visible) {
      case 1:
        updateAns("Core");
        break;
      case 2:
        updateAns("Cosmetics");
        break;
      case 3:
        updateAns("Display");
        break;
      case 4:
        updateAns("Functional_major");
        break;
      case 5:
        updateAns("Functional_minor");
        break;
    }
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
            <ProfileBox />

            <img
              onClick={() => navigate("/selectdevicetype")}
              className="w-28 "
              src={Grest_Logo}
              alt="app logo"
            />
          </div>
        </div>
        <div className={`${styless.quick_page_nav}`}>
          <IoIosArrowBack
            onClick={backHandler}
            size={25}
            className="ml-2 text-[#EC2752]"
          />
          <p className="ml-2 text-xl font-medium">Device Details</p>
        </div>

        <div
          className={`${styles.search_box_wrap} mt-[15px] mb-[5px] w-[90vw]`}
        >
          <div
            className={`flex items-center bg-gray-200  p-2 mb-1 rounded-lg w-[100%] ${styles.search_box}`}
          >
            <div className="flex items-center">
              <CiSearch size={20} className="inline ml-1" />
            </div>
            <input
              placeholder="Search Question"
              onChange={() => console.log("state is ", state)}
              onClick={() => setIsSearchOpen(true)}
              className="inline w-full mx-2 bg-gray-200 outline-none"
              type="text"
            />
            {isSearchOpen && (
              <QuestionSearch
                setIsSearchOpen={setIsSearchOpen}
                state={state}
                dispatch={dispatch}
              />
            )}
          </div>
        </div>

        {/* {visible > 1 && visible <= 6 && (
          <div className="back" onClick={handleSubtract}>
            <MdOutlineKeyboardBackspace size={35} />
          </div>
        )} */}

        <div className="innerContainer">
          <div className={`maindata`}>
            <div className="text-lg font-medium tracking-tight text-{1.325rem}">
              Tell us more about your device?
            </div>
            <div className="underline"></div>
            <div className="questionList">
              {visible == 1 && (
                <div className="containClass">
                  <div className="subheading">
                    <GoDotFill size={15} />
                    <h2>Basic Condition of the Device</h2>
                  </div>
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Core &&
                      state.Core.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(core);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateCoreObject({
                                      index: index,
                                      yesKey: data.yes,
                                      noKey: data.no,
                                      newKey: "yes",
                                      selectedIndex: optionIndex,
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !core[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !core[index].selected[optionIndex]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                          {/* <div className="flex gap-1 two">
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
                        <div className="border-b-2 opacity-10 border-[#595555] "></div> */}
                        </React.Fragment>
                      ))}
                  </div>
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
                    <h2>Physical Condition of the Device</h2>
                  </div>
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Cosmetics &&
                      state.Cosmetics.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(Cosmetics);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateCosmeticsObject({
                                      index: index,
                                      yesKey: data.yes,
                                      noKey: data.no,
                                      newKey: "yes",
                                      selectedIndex: optionIndex,
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !Cosmetics[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !Cosmetics[index].selected[optionIndex]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                  </div>
                  {/* {state.Cosmetics &&
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
                        <div className="border-b-2 opacity-10 border-[#595555] "></div>
                      </div>
                    ))} */}

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
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Display &&
                      state.Display.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(Display);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateDisplayObject({
                                      index: index,
                                      yesKey: data.yes,
                                      noKey: data.no,
                                      newKey: "yes",
                                      selectedIndex: optionIndex,
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !Display[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !Display[index].selected[optionIndex]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                  </div>
                  {/* {state.Display &&
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
                        <div className="border-b-2 opacity-10 border-[#595555] "></div>
                      </div>
                    ))} */}

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
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Functional_major &&
                      state.Functional_major.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(Functional_major);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateFunctionalMajorObject({
                                      index: index,
                                      yesKey: data.yes,
                                      noKey: data.no,
                                      newKey: "yes",
                                      selectedIndex: optionIndex,
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !Functional_major[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !Functional_major[index].selected[
                                        optionIndex
                                      ]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                  </div>
                  {/* {state.Functional_major &&
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
                        <div className="border-b-2 opacity-10 border-[#595555] "></div>
                      </div>
                    ))} */}

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
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Functional_minor &&
                      state.Functional_minor.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(Functional_minor);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateFunctionalMinorObject({
                                      index: index,
                                      yesKey: data.yes,
                                      noKey: data.no,
                                      newKey: "yes",
                                      selectedIndex: optionIndex,
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !Functional_minor[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !Functional_minor[index].selected[
                                        optionIndex
                                      ]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                  </div>
                  {/* {state.Functional_minor &&
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
                        <div className="border-b-2 opacity-10 border-[#595555] "></div>
                      </div>
                    ))} */}

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
                  <div className="w-full flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
                    {state.Warranty &&
                      state.Warranty.map((data, index) => (
                        <React.Fragment key={data._id}>
                          {data?.options.map((option, optionIndex) => (
                            <React.Fragment key={optionIndex}>
                              <div
                                onClick={(e) => {
                                  console.log(Warranty);
                                  console.log("assssaaaaa", option);
                                  console.log("assssaaaaa", data);
                                  console.log(optionIndex + "ok");
                                  store.dispatch(
                                    updateWarrantyObject({
                                      index: index,
                                      newAnswer: data.yes,
                                      newKey: "yes",
                                    })
                                  );
                                }}
                                className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                                  !Warranty[index].selected[optionIndex]
                                    ? "bg-white"
                                    : "bg-[#EC2752]"
                                }`}
                              >
                                <div className="mt-3 mb-1 rounded-md overflow-hidden">
                                  <img
                                    className="scale-[1.2]"
                                    src={imageMap[option.img]}
                                  />
                                </div>
                                <div className="border-t-[1.5px] w-full py-2">
                                  <p
                                    className={`text-xs font-medium text-center ${
                                      !Warranty[index].selected[optionIndex]
                                        ? "text-black"
                                        : "text-white"
                                    }`}
                                  >
                                    {option.caption}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                  </div>

                  {/* <div className="flex flex-col gap-4 mb-4 one">
                    <div className="flex gap-1 two">
                      <p className="text-xl">1.</p>
                      <p className="text-xl three">What is your phone's age?</p>
                    </div> 

                    {state.Warranty &&
                      state.Warranty.map((data, index) => (
                        <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner flex-col">
                          <label
                            className={`text-[#EC2752] font-medium w-full h-[40px] flex  gap-1 p-2 rounded-lg ${
                              Warranty[index].answer === data.yes
                                ? "bg-[#EC2752] text-white"
                                : ""
                            }`}
                          >
                            <input
                              
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
                            {data.quetion}
                          </label>
                        </div>
                      ))}
                    <div className="border-b-2 opacity-10 border-[#595555] "></div>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* {(visible >= 6 )?<div className="fixed bottom-0 w-full   h-[75px] ">
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
                  </div>} */}
        {visible >= 6 ? (
          <div className="fixed bottom-0 flex justify-center w-full gap-2 p-3 bg-white border-t-2">
            <div
              onClick={handleSubtract}
              className={`bg-[#EC2752] w-[20%] px-6 py-2 rounded-lg flex items-center`}
            >
              <ImArrowLeft color="white" size={20} />
            </div>
            <button
              onClick={handleSkip}
              disabled
              className={` bg-slate-400  w-[30%] py-1 px-2 text-center rounded-lg cursor-not-allowed flex justify-between text-white items-center`}
            >
              <p className="w-full p-1 text-xl font-medium">Skip</p>
            </button>
            <div
              onClick={handlesubmit}
              className="bg-[#EC2752] w-[50%] relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center"
            >
              {isLoading && (
                <CgSpinner
                  size={20}
                  className="absolute left-[28%] top-[8px] mt-1 animate-spin"
                />
              )}
              <p className="w-full p-1 text-xl font-medium">
                {isLoading ? "Submitting" : "Submit"}
              </p>
              {/* <FaArrowRight /> */}
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 justify-center flex w-full gap-2 p-3 bg-white border-t-2">
            {visible > 0 && visible <= 6 && (
              <button
                onClick={handleSubtract}
                className={`  ${
                  visible < 2
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#EC2752] cursor-pointer"
                }  w-[20%] px-6 py-2 rounded-lg flex items-center`}
              >
                <ImArrowLeft color="white" size={20} />
              </button>
            )}
            <div
              onClick={handleSkip}
              className="bg-[#EC2752] w-[30%] py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center"
            >
              <p className="w-full p-1 text-xl font-medium">Skip</p>
            </div>
            <div
              onClick={handleADD}
              className="bg-[#EC2752] w-[50%] py-1 px-2 text-center rounded-lg cursor-pointer flex justify-between text-white items-center"
            >
              <p className="w-full p-1 text-xl font-medium">Continue</p>
              {/* <FaArrowRight /> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NewDeviceqs;
