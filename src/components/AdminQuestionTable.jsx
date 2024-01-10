import React from "react";
import { QuestionsList } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import {
  setWarrantyAnswer,
  setCoreAnswer,
  setCosmeticsAnswer,
  setDisplayAnswer,
  setMajorFunctionsAnswer,
  setMinorFunctionsAnswer,
} from "../store/slices/adminAnswerSlice";

const AdminQuestionTable = () => {
  const adminAnswer = useSelector((state) => state.adminAnswer);

  const dispatch = useDispatch();
  const {
    warrantyQuestions,
    coreQuestions,
    displayQuestions,
    majorFunctionsQuestions,
    minorFunctionsQuestions,
    cosmeticsQuestions,
  } = {
    ...QuestionsList,
  };

  return (
    <div className="m-2  w-[90%] overflow-x-auto md:m-5">
      <div className="min-w-max">
        <table className="w-full border border-[#EC2752]">
          <thead className="bg-[#EC2752] text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base">Groups</th>
              <th className="text-left p-2 text-sm md:p-3 md:text-base ">
                Parameter
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">Output</th>
            </tr>
          </thead>

          <tbody>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Warranty
              </td>
              <td className="p-2 w-1/3 text-sm  md:p-3 md:text-base">
                <p> {warrantyQuestions}</p>
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) => dispatch(setWarrantyAnswer(e.target.value))}
                  className="bg-gray-200"
                >
                  <option value="W1">W1</option>
                  <option value="W2">W2</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Core
              </td>

              <td className="p-2 text-sm w-1/3 md:p-3 md:text-base">
                {coreQuestions.map((question, index) => (
                  <p key={index}>{question}</p>
                ))}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) => dispatch(setCoreAnswer(e.target.value))}
                  className="bg-[#F5F4F9]"
                >
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Display
              </td>
              <td className="p-2 text-sm w-1/3 md:p-3 md:text-base">
                {displayQuestions.map((question, index) => (
                  <p key={index}>{question}</p>
                ))}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) => dispatch(setDisplayAnswer(e.target.value))}
                  className="bg-gray-200"
                >
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Major Functions
              </td>
              <td className="p-2 text-sm w-1/3 md:p-3 md:text-base">
                {majorFunctionsQuestions.map((question, index) => (
                  <p key={index}>{question}</p>
                ))}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) =>
                    dispatch(setMajorFunctionsAnswer(e.target.value))
                  }
                  className="bg-[#F5F4F9]"
                >
                  <option value="F1.1">F1.1</option>
                  <option value="F1.2">F1.2</option>
                  <option value="F1.3">F1.3</option>
                </select>
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Minor Functions
              </td>
              <td className="p-2 text-sm w-1/3 md:p-3 md:text-base">
                {minorFunctionsQuestions.map((question, index) => (
                  <p key={index}>{question}</p>
                ))}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) =>
                    dispatch(setMinorFunctionsAnswer(e.target.value))
                  }
                  className="bg-gray-200"
                >
                  <option value="F2.1">F2.1</option>
                  <option value="F2.2">F2.2</option>
                  <option value="F2.3">F2.3</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Cosmetics
              </td>
              <td className="p-2 text-sm w-1/3 md:p-3 md:text-base">
                {cosmeticsQuestions.map((question, index) => (
                  <p key={index}>{question}</p>
                ))}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <select
                  onChange={(e) => dispatch(setCosmeticsAnswer(e.target.value))}
                  className="bg-[#F5F4F9]"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A3">A3</option>
                  <option value="A4">A4</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminQuestionTable;
