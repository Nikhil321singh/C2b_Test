import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { getStatusIcon } from "../../utils/priceUtils";
import { FILE_KEYS, UPLOAD_STATUS } from "../../constants/priceConstants";

/**
 * Utility to convert base64 data URL to a File object
 */
const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl) return null;
  const arr = dataurl.split(",");
  if (arr.length < 2) return null;

  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const DigitalSignatureField = ({
  signatureFile, // The File object itself, from usePriceForm
  setSignatureFile, // The setter from usePriceForm
  uploadStatus, // The uploadStatus object from useFileUpload
  uploadIndividualFile, // The upload function from useFileUpload
  imeinumber, // The IMEI number
  prod, // Product info
}) => {
  const [isDrawing, setIsDrawing] = useState(!signatureFile); // Show pad if no file
  const sigPadRef = useRef(null);
  const sigStatus = uploadStatus[FILE_KEYS.SIGNATURE]?.status;

  const handleClear = () => {
    sigPadRef.current.clear();
  };

  const handleSaveSignature = () => {
    if (sigPadRef.current.isEmpty()) {
      // You can replace this with a toast notification
      alert("Please provide a signature first.");
      return;
    }

    if (!imeinumber) {
      // You can replace this with a toast notification
      alert("Please enter the IMEI number before saving the signature.");
      return;
    }

    // Get the signature as a base64 string
    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");

    // Create the file name
    const fileName = `${imeinumber}-signature`;
    const fullFileName = `${fileName}.png`;

    // Convert to File object
    const newSigFile = dataURLtoFile(dataUrl, fullFileName);

    if (newSigFile) {
      // 1. Set the file in the main form state
      setSignatureFile(newSigFile);
      // 2. Hide the drawing pad
      setIsDrawing(false);
      // 3. Immediately trigger the upload
      uploadIndividualFile(
        newSigFile,
        fileName, // The name without IMEI prefix, as your hook adds it
        newSigFile.type,
        FILE_KEYS.SIGNATURE
      );
    }
  };

  const handleResign = () => {
    setSignatureFile(null); // Clear the file from the main form state
    setIsDrawing(true); // Show the drawing pad again
    // Note: useFileUpload hook should be updated to reset status on setFile(null) if needed
    // For now, it will just show as "pending" if re-uploaded
  };

  // Determine section number, default to 5 if not found
  const sectionNumber = (prod?.[0]?.phoneBillSno || 4) + 1;

  return (
    <div className="flex flex-col eminumber mt-[4px]">
      <div className="flex gap-1 two">
        <p className="text-base font-medium">{sectionNumber}.</p>
        <p className="text-base font-medium three">
          Digital Signature Required
          <span className="text-red-500">*</span>
        </p>
      </div>
      <p className="ml-[19px] text-sm text-gray-600">
        Please sign to confirm your Aadhaar verification and consent.
      </p>

      <div className="flex flex-col items-center gap-2 mt-2 ml-[19px]">
        {isDrawing ? (
          <>
            {/* This div wrapper mimics the PDF snap's red outline */}
            <div className="border-2 border-primary rounded-lg w-full max-w-sm">
              <SignatureCanvas
                ref={sigPadRef}
                penColor="black"
                canvasProps={{
                  width: 300,
                  height: 150,
                  className: "sigCanvas w-full",
                }}
              />
            </div>
            {/* Buttons as per PDF snap */}
            <div className="flex justify-between w-full max-w-sm gap-4">
              <button
                type="button"
                className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg flex-1"
                onClick={handleClear}
              >
                Clear Signature
              </button>
              <button
                type="button"
                className="px-4 py-2 font-bold text-white rounded-lg bg-primary flex-1"
                onClick={handleSaveSignature}
              >
                Save Signature
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Saved state: Show thumbnail and status */}
            <div className="relative p-2 border-2 border-gray-300 rounded-lg w-full max-w-sm h-[150px] flex flex-col items-center justify-center">
              <p className="font-semibold text-green-600">Signature Captured</p>
              {signatureFile && (
                <img
                  src={URL.createObjectURL(signatureFile)}
                  alt="Signature Thumbnail"
                  className="h-[80px] w-full object-contain my-1"
                />
              )}
              <div className="absolute top-1 right-1">
                {getStatusIcon(sigStatus)}
              </div>
              <button
                type="button"
                className="px-4 py-1 mt-1 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg"
                onClick={handleResign}
              >
                Re-sign
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DigitalSignatureField;
