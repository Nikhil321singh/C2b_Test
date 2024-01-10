import React from "react";
import { IoCloseCircle } from "react-icons/io5";
const SummaryModal = ({ show, onClose }) => {
  return (
    <div
      className={`fixed rounded-l-3xl rounded-r-3xl bottom-0 left-0 w-full bg-white p-4 transition-all 
      duration-500 ${show ? "h-[40%]" : "hidden"} overflow-hidden`}
    >
      <div>
        <div>
          <IoCloseCircle
            onClick={onClose}
            size={24}
            className="text-[#EC2752] absolute top-5 right-4"
          />
        </div>
        <div className="font-medium mt-10">
          <p>Selling price: Rs...</p>
          <p>Extra Bonus: Rs...</p>
          <p>Final Selling price: Rs...</p>
        </div>
      </div>
      <button
        className="bg-[#EC2752] fixed bottom-0 mb-4 rounded text-white px-4 py-2 mt-4"
        onClick={onClose}
      >
        Close Modal
      </button>
    </div>
  );
};

export default SummaryModal;
