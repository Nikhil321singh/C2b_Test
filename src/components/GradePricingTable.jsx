import React from "react";
import { GradePricingList } from "../utils/constants";
const GradePricingTable = () => {
  console.log("asdsadsd", GradePricingList);
  return (
    <div className="m-2  w-[90%] md:m-5 overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full border border-[#EC2752]">
          <thead className="bg-[#EC2752] text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base">Model Details</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Brand</th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>A+ Warranty</p>
                <p>(0.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>A</p>
                <p>(10.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>B</p>
                <p>(15.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>B-</p>
                <p>(20.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>C+</p>
                <p>(40.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>C</p>
                <p>(50.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>C-</p>
                <p>(60.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>D+</p>
                <p>(65.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>D</p>
                <p>(70.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>D-</p>
                <p>(70.00%)</p>
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                <p>E</p>
                <p>(90.00%)</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {GradePricingList.map((listItem, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["modelDetails"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["Brand"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["A+WARRANTY"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["A"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["B"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["B-"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["C+"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["C"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["C-"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["D+"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["D"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["D-"]}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {listItem["E"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradePricingTable;
