import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  updateCoreObject,
  updateCosmeticsObject,
  updateDisplayObject,
  updateFunctionalMajorObject,
  updateFunctionalMinorObject,
  updateWarrantyObject,
} from "../../store/slices/QNAslice";
import { useDispatch, useSelector } from "react-redux";
const QuestionSearch = ({ setIsSearchOpen, state }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [answer, setAnswer] = useState("");
  const dispatch = useDispatch();
  const qnaAnswer = useSelector((state) => state.qna);
  console.log("qna", qnaAnswer);
  const handleSearch = () => {
    const filtered = Object.values(state).flatMap((group) =>
      group.filter((question) =>
        question.quetion.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    console.log("asdasdasd", state);
    setFilteredQuestions(filtered);

    const checkedQuestion = filtered.length > 0 ? filtered[0] : null;

    if (checkedQuestion) {
      const questionIndex = qnaAnswer[checkedQuestion.group].findIndex(
        (q) => q.quetion === checkedQuestion.quetion
      );

      setAnswer(qnaAnswer[checkedQuestion.group][questionIndex]?.answer || "");
    }
  };

  const handleChange = (event, index, group, key) => {
    const { value } = event.target;

    const questionIndex = state[group].findIndex((question) => {
      console.log("question", question.quetion);
      console.log("filter", filteredQuestions[0].quetion);
      return question.quetion === filteredQuestions[0].quetion;
    });
    setAnswer(event.target.value);
    console.log("index", questionIndex);
    console.log("ac");
    if (group === "Core") {
      dispatch(
        updateCoreObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    } else if (group === "Cosmetics") {
      dispatch(
        updateCosmeticsObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    } else if (group === "Display") {
      dispatch(
        updateDisplayObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    } else if (group === "Functional_major") {
      dispatch(
        updateFunctionalMajorObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    } else if (group === "Functional_minor") {
      dispatch(
        updateFunctionalMinorObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    } else if (group === "Warranty") {
      dispatch(
        updateWarrantyObject({
          index: questionIndex,
          newAnswer: value,
          newKey: key,
        })
      );
    }
  };
  return (
    <>
      <div className="absolute top-0 left-0 w-full min-h-screen bg-white z-50 ">
        <div className="bg-white p-8 rounded ">
          <div className="flex  p-2 items-center border-2 rounded-lg">
            <div className="mr-2 ">
              <IoClose size={20} onClick={() => setIsSearchOpen(false)} />
            </div>

            <input
              type="text"
              name="Question"
              value={searchQuery}
              placeholder="Search Question..."
              autoFocus
              className=" rounded outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="ml-2 p-2 bg-[#EC2752] text-white rounded"
            >
              Search
            </button>
          </div>

          {filteredQuestions.map((data, index) => (
            <div key={data._id} className="mt-4">
              <div className="font-medium text-lg ml-3 mb-2">
                {data.quetion}
              </div>
              <div className="max-w-[500px] flex gap-4 ml-3 lableconatiner">
                <label
                  className={`text-[#EC2752] font-medium w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                    answer === data.yes ? "bg-[#EC2752] text-white" : ""
                  }`}
                >
                  <input
                    name={data._id}
                    type="radio"
                    hidden
                    value={data.yes}
                    onChange={(e) => handleChange(e, index, data.group, "yes")}
                    checked={answer === data.yes}
                  />{" "}
                  Yes
                </label>
                <label
                  className={`text-[#EC2752] font-medium  w-[150px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                    answer === data.no ? "bg-[#EC2752] text-white" : ""
                  }`}
                >
                  <input
                    name={data._id}
                    type="radio"
                    value={data.no}
                    hidden
                    onChange={(e) => handleChange(e, index, data.group, "no")}
                    checked={answer === data.no}
                  />{" "}
                  No
                </label>
              </div>
            </div>
          ))}
          {filteredQuestions.length > 0 && (
            <button
              className="mt-4 p-2 bg-[#EC2752] text-white rounded"
              onClick={() => setIsSearchOpen(false)}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionSearch;
