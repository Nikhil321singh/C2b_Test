import React, { useEffect, useRef, useState } from "react";
import DevicePriceCards from "../components/DevicePriceCards";
import ContinueButton from "../components/ContinueButton";
import downArrow from "../assets/down.png";
import { useNavigate } from "react-router-dom";
import { useQuestionContext } from "../components/QuestionContext";
import useUserProfile from "../utils/useUserProfile";
import Grest_Logo from "../assets/Grest_Logo.jpeg";
import axios from "axios";
import { IoCloseOutline } from "react-icons/io5";
import ShowReport from "../components/ShowReport";
import { useSelector } from "react-redux";
import { Uplaod_Img_URL } from "../utils/constants";
import User_Logo from "../assets/User_Logo.jpeg";
import { FaCamera } from "react-icons/fa";

const PricePage = ({ submitdata, userToken }) => {
  const [dataModel, setDataModel] = useState({});
  const [message, setMessage] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [file, setFile] = useState(null);
  const [idProofBack, setIdProofBack] = useState(null);
  const [phoneBill, setPhoneBill] = useState(null);
  const [phoneFront, setPhoneFront] = useState(null);
  const [phoneBack, setPhoneBack] = useState(null);
  const [phoneLeft, setPhoneLeft] = useState(null);
  const [phoneRight, setPhoneRight] = useState(null);
  const [phoneTop, setPhoneTop] = useState(null);
  const [phoneBottom, setPhoneBottom] = useState(null);
  const [showReportModel, setShowReportModel] = useState(false);
  const [imeinumber, setImeiNumber] = useState("");
  const [userName, setUserName] = useState();

  const responseData = useSelector((state) => state.responseData);
  console.log("adsadasdsadasdasds", responseData);
  const profile = useUserProfile();
  const { answers, setAnswers } = useQuestionContext();
  const navigate = useNavigate();

  const leadId = sessionStorage.getItem("LeadId");
  const leadsumitDATA = JSON.parse(sessionStorage.getItem("responsedatadata"));

  console.log(leadsumitDATA);
  const handleBack = () => {
    navigate("/inputnumber");
  };
  const handleSubmit = () => {
    localStorage.setItem("ItemPrice", leadsumitDATA.price);
    uploadAllImages();

    // this will happen in next page with special offers
    // axios
    //   .post(
    //     "${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/item-purchased",
    //     { id: submitdata.id },
    //     {
    //       headers: {
    //         Authorization: `${userToken}`,
    //       },
    //     }
    //   )
    //   .then((response) => {
    //     setAnswers([]);
    //     setMessage(response.data.message);
    //     setDisableBtn(true);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  const handleCameraButtonClick = (ref) => {
    // Trigger the file input click when the camera button is clicked
    if (!ref.current) return;
    ref.current.click();
  };

  const handleChange = (setMEthod, e) => {
    setMEthod(e.target.files[0]);
  };

  // console.log("asdasd", idProofBack);
  const fileInputRef = useRef(null); // Create a ref for the file input
  const idproofBackRef = useRef(null);
  const phoneBillRef = useRef(null);
  const phoneFrontRef = useRef(null);
  const phoneBackRef = useRef(null);
  const phoneLeftRef = useRef(null);
  const phoneRightRef = useRef(null);
  const phoneTopRef = useRef(null);
  const phoneBottomRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem("dataModel");
    setDataModel(JSON.parse(data));

    console.log("ansssswwwwwww", answers);
  }, []);

  const uploadAllImages = async () => {
    const formData = new FormData();

    if (file) formData.append("adharFront", file);
    if (idProofBack) formData.append("adharBack", idProofBack);
    if (phoneBill) formData.append("phoneBill", phoneBill);
    if (phoneFront) formData.append("phoneFront", phoneFront);
    if (phoneBack) formData.append("phoneBack", phoneBack);
    if (phoneTop) formData.append("phoneUp", phoneTop);
    if (phoneLeft) formData.append("phoneLeft", phoneLeft);
    if (phoneRight) formData.append("phoneRight", phoneRight);
    if (phoneBottom) formData.append("phoneDown", phoneBottom);
    formData.append("signature", phoneBottom);
    formData.append("IMEI", imeinumber);
    formData.append("leadId", leadsumitDATA?.id);

    // console.log("formdata is", formData);
    // console.log("formdata is", file);
    // console.log("formdata is", idProofBack);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/upload-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `${userToken}`,
          },
        }
      );
      // Handle the response accordingly
      console.log(response.data);

      navigate("/specialoffers");
    } catch (error) {
      console.error(error);
    }
  };

  const otpVerified = useSelector((state) => {
    return state.otpVerification.otpVerified;
  });
  const handleLogoClick = () => {
    navigate("/selectPhone");
  };
  return (
    <div className="h-[100vh] max-h-[200vh] overflow-y-auto ">
      <div className="flex items-center w-screen h-16 py-4 bg-white border-b-2 HEADER header">
        <div className="flex items-center justify-between w-full ">
          <div className="flex flex-row-reverse items-center gap-2 ml-4">
            <p className="mr-4 text-base md:text-xl">{userName}</p>

            <img className="w-[30px]" src={User_Logo} alt="" />
          </div>

          <img
            onClick={() => navigate("/selectdevicetype")}
            className="w-28 "
            src={Grest_Logo}
            alt="app logo"
          />
        </div>
      </div>
      <div className="w-[90%] md:w-[90%] mx-auto  h-[auto] mb-[93px]">
        {/* <p className="mb-4 font-semibold text-center sm:text-xl">
          UPLOAD DOCUMENTS
          {otpVerified == true ? ":" : "-"}
        </p> */}
        {/* <DevicePriceCards
          model={dataModel?.models?.name}
          // price={leadsumitDATA?.price}
          price={responseData?.price}
          ram={dataModel?.models?.config?.RAM}
          storage={dataModel?.models?.config?.storage}
          setShowReportModel={setShowReportModel}
          showReport={true}
        /> */}
        {/* {showReportModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
              <IoCloseOutline
                onClick={() => setShowReportModel(false)}
                className="cursor-pointer sticky top-0 left-[700px] text-gray-500 hover:text-gray-700"
                size={24}
              />
              <div className="modal-content ">
                Your phone is in good condition
              </div>
              <button onClick={() => setShowReportModel(false)}>close</button>
            </div>
          </div>
        )} */}
        {/* {showReportModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
              <div className="modal-content ">
                <ShowReport
                  id={leadId}
                  setShowReportModel={setShowReportModel}
                />
              </div>
            </div>
          </div>
        )} */}

        {/* {message && <h3 className="mt-4 text-xl text-center">{message}</h3>} */}

        <div className="mt-3 text-center">
          <h1 className="text-2xl font-semibold">Upload Documents</h1>
          {/* <h1 className="text-2xl font-semibold">National ID Card</h1> */}
          <p className="mt-4 text-gray-600">
            Regulations require you to upload a national identity card. Don't
            worry, your data will stay safe and private.
          </p>
        </div>
        
         {/* //emi number  */}
        <div className="flex flex-col">
          <div className="flex flex-col eminumber mt-[4px]">
            <div className="flex gap-1 two">
              <p className="text-base font-medium">1.</p>
              <p className="text-base font-medium three">Enter your IMEI No.</p>
            </div>

            <div className="flex items-center gap-4 mt-2 ml-[19px]">
              <input
                type="text"
                className="w-auto p-2 border-2 border-gray-300 rounded"
                value={imeinumber}
                placeholder="IMEI No."
                onChange={(e) => setImeiNumber(e.target.value)}
                maxLength={15}
              />
              <button className="px-4 py-2 font-bold text-white bg-[#f4486dd0] rounded hover:bg-[#ec2752]">Verify</button>
            </div>
          </div>

          {/* //adharcard */}
          <div className="flex flex-col adharcard mt-[10px]">
          <div className="flex gap-1 two">
              <p className="text-base font-medium">2.</p>
              <p className="text-base font-medium three">Upload your Aadhar Card</p>
            </div>

            <div className="flex inputAADHAR justify-evenly">

              {/* 1 */}
              <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative flex flex-col border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold text-center">Adhaar(Front)</p>
              <input
                type="file"
                onChange={(e) => handleChange(setFile, e)}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
              <button onClick={() => handleCameraButtonClick(fileInputRef)} >
                {!file  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(file)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>
            
            {/* 2 */}

            <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold text-center">Adhaar(Back)</p>
              <input
                type="file"
                onChange={(e) => handleChange(setIdProofBack, e)}
                style={{ display: "none" }}
                ref={idproofBackRef}
              />
              <button onClick={() => handleCameraButtonClick(idproofBackRef)}>
                {!idProofBack  ? (
                   <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                   <FaCamera />
                   <span className="block tracking-tighter" >Select file</span>
                 </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(idProofBack)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>
            
            </div>
            
          </div>

          {/* //phoneBill */}
          <div className="flex flex-col adharcard mt-[10px]">
          <div className="flex gap-1 two">
              <p className="text-base font-medium">2.</p>
              <p className="text-base font-medium three">Upload your Phone Bill</p>
            </div>

            <div className="flex justify-start ml-3 inputAADHAR">

              {/* 1 */}
              <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold text-center">Phone Bill</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneBill, e)}
                style={{ display: "none" }}
                ref={phoneBillRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneBillRef)} >
                {!phoneBill  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneBill)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>
            
          </div>
            
          </div>



          {/* //phones phtos */}
           
          <div className="flex flex-col adharcard mt-[10px] ">
          <div className="flex gap-1 two">
              <p className="text-base font-medium">3.</p>
              <p className="text-base font-medium three">Upload your Phone Images</p>
            </div>

            <div className="flex flex-wrap inputAADHAR justify-evenly">

              {/* 1 */}
              <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold text-center">Phone Front</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneFront, e)}
                style={{ display: "none" }}
                ref={phoneFrontRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneFrontRef)} >
                {!phoneFront  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneFront)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>


            {/* 2 */}
            <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold text-center">Phone Back</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneBack, e)}
                style={{ display: "none" }}
                ref={phoneBackRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneBackRef)} >
                {!phoneBack  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneBack)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>

           
           {/* 3 */}

           <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] ">
              <p className="font-semibold tracking-tighter text-center">Phone Left Side</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneLeft, e)}
                style={{ display: "none" }}
                ref={phoneLeftRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneLeftRef)} >
                {!phoneLeft  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneLeft)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>


            {/* 4 */}
            <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold tracking-tighter text-center">Phone Right Side</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneRight, e)}
                style={{ display: "none" }}
                ref={phoneRightRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneRightRef)} >
                {!phoneRight  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneRight)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>

            {/* 5 */}
            <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold tracking-tighter text-center">Phone Top Side</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneTop, e)}
                style={{ display: "none" }}
                ref={phoneTopRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneTopRef)} >
                {!phoneTop  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneTop)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>

            {/* 6 */}
            <div className="p-1 mt-4 text-center border-2  rounded-lg h-[15vh] w-[40vw] relative border-[#ff4176] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
              <p className="font-semibold tracking-tighter text-center">Phone Bottom Sid</p>
              <input
                type="file"
                onChange={(e) => handleChange(setPhoneBottom, e)}
                style={{ display: "none" }}
                ref={phoneBottomRef}
              />
              <button onClick={() => handleCameraButtonClick(phoneBottomRef)} >
                {!phoneBottom  ? (
                  <i className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 fa-camera top-[70%] left-1/2" >
                    <FaCamera />
                    <span className="block tracking-tighter">Select file</span>
                  </i>
                ) : (
                  <img
                    className="max-w-full max-h-[200px]"
                    src={URL.createObjectURL(phoneBottom)}
                    alt="Uploaded file"
                  />
                )}
              </button>
            </div>
            
 
            </div>
            
          </div>
          

        </div>
        {/* <div>
          <button
            className="px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 mb-28"
            onClick={uploadAllImages}
          >
            Upload All Images
          </button>
        </div> */}
      </div>

      {!disableBtn ? (
        <div onClick={handleSubmit}>
          <ContinueButton buttonName="Submit details" />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PricePage;
