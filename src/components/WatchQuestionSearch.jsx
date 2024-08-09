import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  updateCoreObject,
  updateCosmeticsObject,
  updateDisplayObject,
  updateFunctionalMajorObject,
  updateFunctionalMinorObject,
  updateWarrantyObject,
} from "../store/slices/QNAslice";
import { useDispatch, useSelector } from "react-redux";
import store from "../store/store";

const WatchQuestionSearch = ({ setIsSearchOpen, state, imageMap }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const qnaAnswer = useSelector((AnsState) => AnsState.qna);

  const handleSearch = () => {
    console.log(state);
    const uniqueQuestions = new Set();

    const filtered = Object.entries(state).flatMap(
      ([groupKey, group], groupIndex) =>
        group
          .filter((question, questionIndex) => {
            
            return question.quetion
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              groupKey.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .map((question, questionIndex) => ({
            ...question,
            questionIndex: questionIndex,
            groupKey: groupKey,
          }))
    );
    console.log(filtered);
    setFilteredQuestions(filtered);
  };

  const handleChange = (event, index, group, optionIndex, yesKey, noKey) => {
    if (group === "Core") {
      store.dispatch(
        updateCoreObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Cosmetics") {
      store.dispatch(
        updateCosmeticsObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Display") {
      store.dispatch(
        updateDisplayObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Functional_major") {
      store.dispatch(
        updateFunctionalMajorObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Functional_minor") {
      store.dispatch(
        updateFunctionalMinorObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Warranty") {
      store.dispatch(
        updateWarrantyObject({
          index: index,
          newAnswer: yesKey,
          newKey: "yes",
        })
      );
    }
  };
  return (
    <>
      <div className="fixed top-0 left-0 w-full min-h-full bg-white z-50">
        <div className="bg-white py-4 px-8 rounded">
          <div
            className="flex items-center rounded-lg"
            style={{
              boxShadow:
                "1px 1px 2px 0px rgba(0, 0, 0, 0.158), 0px 0px 0px 0px rgba(0, 0, 0, 0.034)",
            }}
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 bg-[#EC2752] text-white rounded"
            >
              <IoClose size={30} />
            </button>
            <input
              type="text"
              name="Question"
              value={searchQuery}
              placeholder="Search Question..."
              autoFocus
              className="rounded-[.55rem] outline-none mx-auto"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={(e) => setSearchQuery("")}
              className="py-[7px] px-2 flex flex-col items-center justify-center bg-[#EC2752] text-white rounded"
            >
              <p className="">Clear</p>
            </button>
          </div>
          <div className="w-[90%] mx-auto mt-4 flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
            {filteredQuestions.map((data, index) => (
            <div
              key={data._id}
              className={`flex flex-col justify-start items-center`}
              onClick={() => {
              }}
            >
              <img src={"temp"} className="bg-white" />
              <p className="py-2 px-2 w-[100%] flex flex-row items-center justify-center text-xs font-medium text-balance">
                {data.quetion}
              </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WatchQuestionSearch;
