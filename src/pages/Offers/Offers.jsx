import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
const navViewOfferr = "/viewofferdetail";

const offerArray = [
  { id: "GRU1000", label: "GRU1000" },
  { id: "GRU1000", label: "GRU1000" },
  { id: "GRU2000", label: "GRU2000" },
  { id: "GRU700", label: "GRU700" },
  { id: "GRU900", label: "GRU900" },
];

const Offers = () => {
  const storedItem = JSON.parse(sessionStorage.getItem("rowData")) || {};
  const storedUser = sessionStorage.getItem("offerUserName");
  const item = storedItem;
  const authToken = sessionStorage.getItem("authToken");
  const [sideMenu, setsideMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const [offerName, setOfferName] = useState(
    item?.offerName ? item?.offerName : ""
  );
  const [price, setPrice] = useState(item ? item?.price : 0);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [warranty, setWarranty] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getData = () => {
    const data = {
      offerName: offerName,
      price: price,
      validFrom: validFrom,
      validTo: validTo,
      createdBy: createdBy,
      warranty: warranty,
    };
    if (item && item.editoffer) {
      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/edit/${
          item?._id
        }`,
        data,
        headers: { authorization: authToken },
      };
      axios
        .request(config)
        .then((response) => {
          toast.success("Successfully updated offer details");
          sessionStorage.removeItem("rowData");
          setOfferName("");
          setPrice(0);
          setValidFrom("");
          setValidTo("");
          setCreatedBy("");
          setWarranty(true);
          navigate(navViewOfferr);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to updated offer details");
        });
    } else {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/create`,
        data,
        headers: { authorization: authToken },
      };

      axios
        .request(config)
        .then((response) => {
          toast.success("Successfully created offer");
          navigate(navViewOfferr);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Failed to create offer");
        });
    }
  };

  const handleOffer = (e) => {
    e.preventDefault();
    getData();
  };

  useEffect(() => {
    if (item) {
      const date = new Date(item.validFrom);
      const year = date.getFullYear();
      const month = `0${date.getMonth() + 1}`.slice(-2); // Months are 0-indexed in JavaScript
      const day = `0${date.getDate()}`.slice(-2);
      const dateto = new Date(item.validTo);
      const yearto = dateto.getFullYear();
      const monthto = `0${dateto.getMonth() + 1}`.slice(-2); // Months are 0-indexed in JavaScript
      const dayto = `0${dateto.getDate()}`.slice(-2);

      setOfferName(item.offerName || "");
      setPrice(item.price || 0);
      setValidFrom(`${year}-${month}-${day}` || "");
      setValidTo(`${yearto}-${monthto}-${dayto}` || "");
      setCreatedBy(storedUser || "");
      setWarranty(item?.warranty ?? true);
    }
  }, [item]);

  return (
    <div className="min-h-screen  pb-8 bg-[#F5F4F9]">
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <SubOffer
        offerName={offerName}
        setOfferName={setOfferName}
        price={price}
        setPrice={setPrice}
        validFrom={validFrom}
        setValidFrom={setValidFrom}
        validTo={validTo}
        setValidTo={setValidTo}
        createdBy={createdBy}
        setCreatedBy={setCreatedBy}
        warranty={warranty}
        setWarranty={setWarranty}
        handleOffer={handleOffer}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
      />
    </div>
  );
};

const SubOffer = ({
  offerName,
  setOfferName,
  price,
  setPrice,
  validFrom,
  setValidFrom,
  validTo,
  setValidTo,
  createdBy,
  setCreatedBy,
  warranty,
  setWarranty,
  handleOffer,
  isModalOpen,
  closeModal,
}) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
      }}
      className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
    >
      <div className="flex flex-col  w-[900px]">
        <div className="mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
          <p className="text-4xl font-bold">Offers</p>
          <p className="text-lg">All fields marked with * are required</p>
        </div>

        <div className="flex flex-wrap gap-2 ml-10 mb-10">
          <button
            onClick={() => navigate(navViewOfferr)}
            className="font-medium text-sm text-white p-3 rounded bg-[#EC2752]"
          >
            View Detail
          </button>
        </div>
        <form className="ml-10 flex flex-col gap-4">
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Offer Name *</span>
            <input
              className="border-2 px-2 py-2 rounded-lg outline-none"
              type="text"
              required
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Price *</span>
            <input
              className="border-2 px-2 py-2 rounded-lg  outline-none "
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-[70%] gap-2 ">
            <span className="font-medium text-xl">Valid From *</span>
            <input
              className="border-2 px-2 py-2 rounded-lg  outline-none"
              type="date"
              required
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Valid To *</span>
            <input
              className="border-2 px-2 py-2 rounded-lg  outline-none"
              type="date"
              required
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-[70%] gap-2">
            <span className="font-medium text-xl">Created By</span>
            <input
              className="border-2 px-2 py-2 rounded-lg  outline-none"
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>
          <span className="font-medium text-xl">If Warranty</span>
          <div className="flex gap-2 -mt-2">
            <label
              className={`text-[#EC2752] font-medium w-[100px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                warranty === true
                  ? "bg-[#EC2752] text-white"
                  : "border-[#EC2752] border-2"
              }`}
            >
              <input
                style={{ display: "none" }}
                name="warranty"
                type="radio"
                onClick={(e) => setWarranty(true)}
              />{" "}
              True
            </label>
            <label
              className={`text-[#EC2752]  font-medium w-[100px] h-[40px] flex items-center gap-1 p-2 rounded-lg ${
                warranty === false
                  ? "bg-[#EC2752] text-white"
                  : "border-2 border-[#EC2752]"
              }`}
            >
              <input
                style={{ display: "none" }}
                name="warranty"
                type="radio"
                onClick={(e) => setWarranty(false)}
              />{" "}
              False
            </label>
          </div>
          <div className="mt-8">
            <button
              onClick={(e) => handleOffer(e)}
              className="font-medium text-sm text-white px-8 py-3 rounded bg-[#EC2752]"
            >
              Submit
            </button>
          </div>
        </form>
        {isModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
            <div
              className="absolute w-full h-full bg-gray-900 opacity-50"
              onClick={closeModal}
            ></div>
            <div className="bg-white p-8 rounded-lg z-10">
              <div className="flex flex-col gap-2">
                {offerArray.map((element, offerIndex) => (
                  <div
                    key={offerIndex}
                    className="flex gap-4 items-center justify-between"
                  >
                    <p className="text-xl font-medium min-w-[80px]">
                      {element.label}
                    </p>
                    <select className="bg-gray-200 font-medium rounded-lg p-2 outline-none">
                      <option value="">Choose Action</option>
                      <option value="">View</option>
                      <option value="">Edit</option>
                      <option value="">Delete</option>
                      <option value="">Download</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
