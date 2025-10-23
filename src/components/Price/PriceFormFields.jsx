import React from "react";
import ImeiField from "./ImeiField";
import AadharNumberField from "./AadharNumberField";
import AdharField from "./AdharField";
import PhoneBill from "./PhoneBill";
import PhonePhotos1 from "./PhonePhotos1";
import DigitalSignatureField from "./DigitalSignatureField";


const PriceFormFields = ({
  formState,
  uploadStatus,
  handleFileChange,
  handleCameraButtonClick,
  uploadIndividualFile
}) => {
  const {
    file,
    setFile,
    idProofBack,
    setIdProofBack,
    phoneBill,
    setPhoneBill,
    phoneFront,
    setPhoneFront,
    phoneBack,
    setPhoneBack,
    phoneBottom,
    setPhoneBottom,
    phoneTop,
    setPhoneTop,
    phoneLeft,
    setPhoneLeft,
    phoneRight,
    setPhoneRight,
    signatureFile, // new signature state
    setSignatureFile, // <-- new signature state set function
    aadharNumber,
    setAadharNumber,
    imeinumber,
    setImeiNumber,
    isBillRequired,
    prod,
    fileInputRef,
    idproofBackRef,
    phoneBillRef,
    phoneFrontRef,
    phoneBackRef,
    phoneBottomRef,
    phoneTopRef,
    phoneLeftRef,
    phoneRightRef,
  } = formState;

  return (
    <div className="flex flex-col">
      <ImeiField
        setImeiNumber={setImeiNumber}
        imeinumber={imeinumber}
        prod={prod}
      />
      <AadharNumberField
        setAadharNumber={setAadharNumber}
        aadharNumber={aadharNumber}
        prod={prod}
      />
      <AdharField
        handleChange={handleFileChange}
        setFile={setFile}
        fileInputRef={fileInputRef}
        handleCameraButtonClick={handleCameraButtonClick}
        file={file}
        setIdProofBack={setIdProofBack}
        idProofBack={idProofBack}
        idproofBackRef={idproofBackRef}
        prod={prod}
        uploadStatus={uploadStatus}
      />
      <PhoneBill
        handleChange={handleFileChange}
        setPhoneBill={setPhoneBill}
        phoneBackRef={phoneBackRef}
        handleCameraButtonClick={handleCameraButtonClick}
        phoneBillRef={phoneBillRef}
        phoneBill={phoneBill}
        isBillRequired={isBillRequired}
        prod={prod}
        uploadStatus={uploadStatus}
      />
      <PhonePhotos1
        handleCameraButtonClick={handleCameraButtonClick}
        handleChange={handleFileChange}
        phoneFront={phoneFront}
        setPhoneFront={setPhoneFront}
        phoneFrontRef={phoneFrontRef}
        setPhoneBottom={setPhoneBottom}
        phoneBackRef={phoneBackRef}
        phoneBack={phoneBack}
        phoneBottom={phoneBottom}
        phoneTop={phoneTop}
        phoneBottomRef={phoneBottomRef}
        setPhoneLeft={setPhoneLeft}
        setPhoneBack={setPhoneBack}
        setPhoneTop={setPhoneTop}
        phoneLeft={phoneLeft}
        phoneRight={phoneRight}
        phoneTopRef={phoneTopRef}
        phoneRightRef={phoneRightRef}
        setPhoneRight={setPhoneRight}
        phoneLeftRef={phoneLeftRef}
        prod={prod}
        uploadStatus={uploadStatus}
      />
      {/* Added New Signature Filed */}
      <DigitalSignatureField
        signatureFile={signatureFile}
        setSignatureFile={setSignatureFile}
        uploadStatus={uploadStatus}
        uploadIndividualFile={uploadIndividualFile}
        imeinumber={imeinumber}
        prod={prod}
      />
    </div>
  );
};

export default PriceFormFields;
