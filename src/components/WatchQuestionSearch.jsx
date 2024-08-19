import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
const WatchQuestionSearch = ({ setIsSearchOpen, state, imageMap }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredQuestions = [];

  return (
    <>
      <div className="fixed bg-white top-0 left-0 w-full min-h-full z-50">
        <div className="bg-white rounded py-4 px-8 ">
          <div
            style={{
              boxShadow:
                "1px 1px 2px 0px rgba(0, 0, 0, 0.158), 0px 0px 0px 0px rgba(0, 0, 0, 0.034)",
            }}
            className="flex rounded-lg items-center"
          >
            <button
              className="p-1 bg-[#EC2752] text-white rounded"
              onClick={() => setIsSearchOpen(false)}
            >
              <IoClose size={30} />
            </button>
            <input
              name="Question"
              type="text"
              placeholder="Search Question..."
              value={searchQuery}
              className="rounded-[.55rem] outline-none mx-auto"
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="py-[7px] flex flex-col items-center px-2 justify-center bg-[#EC2752] text-white rounded"
              onClick={(e) => setSearchQuery("")}
            >
              <p className="">Clear</p>
            </button>
          </div>
          <div className="w-[90%] mt-4 mx-auto flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
            {filteredQuestions.map((data, index) => (
              <div
                key={data._id}
                className={`flex flex-col items-center justify-start`}
                onClick={() => {}}
              >
                <img src={"temp"} className="bg-white" />
                <p className="py-2 px-2 w-[100%] items-center flex flex-row justify-center text-xs font-medium text-balance">
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
