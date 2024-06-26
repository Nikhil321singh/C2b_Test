import { useNavigate } from "react-router-dom";
import { useEffect, useReducer, useState } from "react";
import Grest_Logo from "../../assets/Grest_Logo.jpg";
import { IoIosArrowBack } from "react-icons/io";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
import { useQuestionContext } from "../../components/QuestionContext";
import axios from "axios";
import {
  setGroupAnswerss,
  updateCoreObjects,
  updateCosmeticsObjects,
  updateDisplayObjects,
  updateFunctionalMajorObjects,
  updateFunctionalMinorObjects,
  updateWarrantyObjects,
} from "../../store/slices/quickQNAslice";
import store from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import "../DeviceDetailnew/newDeviceqs.scss";
import styless from "./QuickQuote.module.css";
import { CgSpinner } from "react-icons/cg";
import useUserProfile from "../../utils/useUserProfile";
import { setResponseData } from "../../store/slices/responseSlice";

const QuickQuote = () => {
  const navigate = useNavigate();
  const { answersQuick, setAnswersQUICK } = useQuestionContext();
  const dispatch = useDispatch();
  const core = useSelector((state) => state.qnaQuick.Core);
  const Cosmetics = useSelector((state) => state.qnaQuick.Cosmetics);
  const Display = useSelector((state) => state.qnaQuick.Display);
  const Functional_major = useSelector(
    (state) => state.qnaQuick.Functional_major
  );
  const Functional_minor = useSelector(
    (state) => state.qnaQuick.Functional_minor
  );
  const Warranty = useSelector((state) => state.qnaQuick.Warranty);
  const qnaQuick = useSelector((state) => state.qnaQuick);

  const backHandler = () => {
    navigate("/selectmodel");
  };

  const initialState = {
    Core: [],
    Cosmetics: [],
    Display: [],
    Functional_major: [],
    Functional_minor: [],
    Warranty: [],
  };
  // fot mpping
  function reducer(state, action) {
    switch (action.type) {
      case "SET_GROUP_ANSWERS":
        return { ...state, [action.group]: action.answers };
      default:
        throw new Error();
    }
  }

  //intilize reducer
  const [state, Dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const userToken = sessionStorage.getItem("authToken");
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
          const answers = response.data.data
            .filter((question) => question.group === group)
            .slice(0, group !== "Warranty" ? 2 : undefined);

          Dispatch({ type: "SET_GROUP_ANSWERS", group, answers });
        });
        const newPopulateAnswers = response.data.data.map((ele) => ele.default);
        if (answersQuick.length === 0) {
          const newAnswers = newPopulateAnswers.map((answer, index) => {
            return {
              quetion: response.data.data[index].quetion,
              answer,
              key: response.data.data[index].yes === answer ? "yes" : "no",
              group: response.data.data[index].group,
            };
          });
          setAnswersQUICK(newAnswers);
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

            dispatch(setGroupAnswerss({ group, answers }));
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const profile = useUserProfile();
  const handlesubmit = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem("authToken");
    let id = sessionStorage.getItem("dataModel");
    id = JSON.parse(id);

    const finalPayload = {
      QNA: qnaQuick,
      phoneNumber: "123456789",
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
    sessionStorage.setItem("LeadId", response.data.data.id);
    sessionStorage.setItem(
      "responsedatadata",
      JSON.stringify(response.data.data)
    );
    sessionStorage.setItem("ExactQuote", false);
    dispatch(setResponseData(response.data.data));
    setIsLoading(false);
    navigate("/devicequote");
  };

  return (
    <>
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

        <div className="innerContainer">
          <div className="maindata">
            <div className="text-lg font-medium tracking-tight text-{1.325rem}">
              Tell us more about your device?
            </div>
            <div className="underline"></div>
            <div className="questionList ">
              <div className="containClass ">
                {state.Core &&
                  state.Core.map((data, index) => (
                    <div
                      className="flex flex-col gap-4 mb-4 one relative"
                      key={data._id}
                    >
                      <div className="flex items-baseline gap-1 two">
                        <p className="font-medium text-xl">{index + 1}.</p>
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
                              dispatch(
                                updateCoreObjects({
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
                              dispatch(
                                updateCoreObjects({
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
                      <div className="border-b-2 opacity-10 border-[#595555] "></div>
                    </div>
                  ))}
              </div>

              {/* //for cosmetics */}

              <div className="containClass">
                {state.Cosmetics &&
                  state.Cosmetics.map((data, index) => (
                    <div
                      className="flex flex-col gap-4 mb-4 one"
                      key={data._id}
                    >
                      <div className="flex items-baseline gap-1 two">
                        <p className="font-medium text-xl">{index + 3}.</p>
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
                              dispatch(
                                updateCosmeticsObjects({
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
                              dispatch(
                                updateCosmeticsObjects({
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
                      <div className="border-b-2 opacity-10 border-[#595555]"></div>
                    </div>
                  ))}
              </div>

              {/* //for display */}

              <div className="containClass">
                {state.Display &&
                  state.Display.map((data, index) => (
                    <div
                      className="flex flex-col gap-4 mb-4 one"
                      key={data._id}
                    >
                      <div className="flex items-baseline gap-1 two">
                        <p className="font-medium text-xl">{index + 5}.</p>
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
                              dispatch(
                                updateDisplayObjects({
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
                              dispatch(
                                updateDisplayObjects({
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
                  ))}
              </div>

              {/* //Functional_major*/}

              <div className="containClass">
                {state.Functional_major &&
                  state.Functional_major.map((data, index) => (
                    <div
                      className="flex flex-col gap-4 mb-4 one"
                      key={data._id}
                    >
                      <div className="flex items-baseline gap-1 two">
                        <p className="font-medium text-xl">{index + 7}.</p>
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
                              dispatch(
                                updateFunctionalMajorObjects({
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
                              dispatch(
                                updateFunctionalMajorObjects({
                                  index: index,
                                  newAnswer: data.no,
                                  newKey: "no",
                                })
                              );
                            }}
                            checked={Functional_major[index].answer === data.no}
                          />{" "}
                          No
                        </label>
                      </div>
                      <div className="border-b-2 opacity-10 border-[#595555]"></div>
                    </div>
                  ))}
              </div>

              {/* //for Functional_minor */}

              <div className="containClass">
                {state.Functional_minor &&
                  state.Functional_minor.map((data, index) => (
                    <div
                      className="flex flex-col gap-4 mb-4 one"
                      key={data._id}
                    >
                      <div className="flex items-baseline gap-1 two">
                        <p className="font-medium text-xl">{index + 9}.</p>
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
                              dispatch(
                                updateFunctionalMinorObjects({
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
                              dispatch(
                                updateFunctionalMinorObjects({
                                  index: index,
                                  newAnswer: data.no,
                                  newKey: "no",
                                })
                              );
                            }}
                            checked={Functional_minor[index].answer === data.no}
                          />{" "}
                          No
                        </label>
                      </div>
                      <div className="border-b-2 opacity-10 border-[#595555]"></div>
                    </div>
                  ))}
              </div>

              {/* //fro Warranty */}

              <div className="containClass">
                <div className="flex flex-col gap-4 mb-4 one">
                  <div className="flex gap-1 two">
                    <p className="text-xl">11.</p>
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
                              store.dispatch(
                                updateWarrantyObjects({
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2">
          <div
            onClick={handlesubmit}
            className="bg-[#EC2752] text-center relative  py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center"
          >
            {isLoading && (
              <CgSpinner
                size={20}
                className="mt-1 absolute left-[28%] top-[8px] animate-spin"
              />
            )}
            <p className="w-full p-1 text-xl font-medium">
              {isLoading ? "Submitting" : "Submit"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickQuote;
