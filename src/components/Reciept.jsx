import React from "react";
import grest_logo from "../assets/grest_pdf.jpg";

const PurchaseReceipt = ({
  imeiNumber,
  phoneNumber,
  phoneName,
  storage,
  RAM,
  formattedDate,
}) => {
  return (
    <div className="w-full  p-4 bg-white border-2 text-sm">
      <div className="flex items-center justify-center mb-2 bg-white p-[2vh] mx-[2vh] my-[2vh]">
        <img src={grest_logo} alt="Grest logo" className="w-24 h-12" />
      </div>
      <div className="flex flex-col items-center justify-between mb-2">
        <p className="text-sm ">
          <span className="font-bold"> Office Address:</span> Plot 54, Sector 44
          Institutional Area, Gurugram 122002
        </p>
        <p className="text-sm">
          <span className="font-bold"> Phone:</span> 555-55-55-5557
        </p>
        {/* <p className="text-sm text-gray-500">Service No: 1234567890</p> */}
      </div>
      <div className="text-center">
        <p className="font-bold text-3xl">PURCHASE RECEIPT</p>
      </div>
      <div className="max-w-[70%] flex items-center mt-4 justify-between mx-auto">
        <div>
          <p>
            <span className="font-bold"> Service No.:</span>
          </p>
          <p>
            <span className="font-bold"> Date:</span> {formattedDate}
          </p>
        </div>
        <div className=" p-4 border-2 border-black">
          <p>
            <span className="font-bold"> Purchased From:</span>
          </p>
          <p>
            <span> Contact: {phoneNumber}</span>
          </p>
          <p>
            <span> Mail:</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <p className="font-bold">S.No.</p>
          <p>1</p>
        </div>
        <div>
          <p className="font-bold">Item</p>
          <p>
            {phoneName} ({storage}/{RAM})
          </p>
        </div>
      </div>
      <hr className="border-black mt-10 border-1" />
      <div className="flex flex-col items-center border-b-2 border-dashed border-black py-4 ">
        <p className="font-bold">Via Retail Store Partner:</p>
        <p>UNICORN @ ONE HORIZON CENTER</p>
        <p>
          SHOP NO.T1-112, FLOOR PLAZAGOLF COURSE ROAD, SECTOR 43 Gurgaon Haryana
        </p>
        <p>Gurgaon, Haryana, 122002</p>
        <p className="text-[8px]">
          This is a Computer Generated Purchase Receipt and does not require
          signature or stamp
        </p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-3xl font-bold my-4">IDEMNITY BOND</p>
        <p className="text-center">
          This bond of idemnity is made and executed by :{" "}
          <span className="font-bold underline">UserName</span> Herein after
          referred to as "Seller" who has come in Retail store of{" "}
          <span className="font-bold underline">UNICORN @ HORIZON CENTER</span>{" "}
          to sell his/her old Gadget, to the Grest Network herein referred to as
          "Purchaser" which expression shall mean and include its
          representative, executors, nominee, partners, affiliates and assigns
          on day <span>date</span>
        </p>
      </div>

      <div>
        <p className="mt-4">
          <span> IMEI NO.: {imeiNumber}</span>
        </p>
        <p className="font-bold">Seller Name and Sign</p>
      </div>
    </div>
  );
};

export default PurchaseReceipt;
