import React from "react";
import { useSelector } from "react-redux";
const AdminFinalGradeTable = () => {
  const adminAnswer = useSelector((state) => state.adminAnswer);
  return (
    <div className="m-2  w-[90%] overflow-x-auto md:m-5 ">
      <table className="w-full border-2 border-[#EC2752]  ">
        <thead className="bg-[#EC2752] text-white ">
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Groups</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Values</th>
          </tr>
        </thead>

        <tbody>
          <tr className="bg-gray-200 ">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Warranty
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.warrantyAnswer}
            </td>
          </tr>
          <tr>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Core
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.coreAnswer}
            </td>
          </tr>
          <tr className="bg-gray-200">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Display
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.displayAnswer}
            </td>
          </tr>
          <tr>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Major Functions
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.majorFunctionsAnswer}
            </td>
          </tr>
          <tr className="bg-gray-200">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Minor Functions
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.minorFunctionsAnswer}
            </td>
          </tr>
          <tr>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Cosmetics
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {adminAnswer.cosmeticsAnswer}
            </td>
          </tr>
          <tr className="bg-gray-200">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Final Grade
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">NA</td>
          </tr>
          <tr>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Pricing
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">NA</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminFinalGradeTable;
