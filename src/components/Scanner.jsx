import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import Quagga from "quagga";
import { IoMdArrowRoundBack } from "react-icons/io";
import styles from "../styles/Scanner.module.css";

const Scanner = (props) => {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("steady");
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      startNativeScan();
    } else {
      startWebScan();
    }

    return () => {
      stopNativeScan();
      stopWebScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Native scan for iOS & Android
  const startNativeScan = async () => {
    try {
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        alert("Camera permission denied");
        props.scanBoxSwitch();
        return;
      }

      await BarcodeScanner.hideBackground();
      document.body.classList.add("scanner-active");

      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        handleScanResult(result.content);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Native scan error", err);
      setStatus("error");
    }
  };

  const stopNativeScan = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.body.classList.remove("scanner-active");
  };

  // Web scan (Quagga)
  const startWebScan = () => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#interactive"),
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader"],
        },
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          setStatus("error");
          return;
        }
        Quagga.start();
      }
    );
    Quagga.onDetected(onDetected);
    Quagga.onProcessed(onProcessed);
  };

  const stopWebScan = () => {
    Quagga.offDetected(onDetected);
    Quagga.offProcessed(onProcessed);
    Quagga.stop();
  };

  const onDetected = (res) => {
    if (res && res.codeResult && res.codeResult.code) {
      handleScanResult(res.codeResult.code);
    }
  };

  const onProcessed = (result) => {
    if (result) {
      setStatus("steady"); // Avoid showing red if just processing
    }
  };

  const handleScanResult = (code) => {
    setResult(code);
    setStatus("success");
    props.setImei(code);
    if (isNative) stopNativeScan();
    else stopWebScan();
    props.scanBoxSwitch();
  };

  const handleBack = () => {
    if (isNative) stopNativeScan();
    else stopWebScan();
    props.scanBoxSwitch();
  };

  return (
    <div className={`my-auto ${styles.scan_page_wrap}`}>
      <div className="flex flex-row gap-4 w-full items-center justify-center">
        <button className="mb-2 flex items-center" onClick={handleBack}>
          <IoMdArrowRoundBack size={20} className="mr-1" />
          Back
        </button>
      </div>

      <div
        id="interactive"
        className={`h-80 border-2 ${
          status === "steady" && "border-primary"
        } ${status === "success" && "border-green-300"} ${
          status === "error" && "border-red-500"
        }`}
      >
        {!isNative && (
          <p className="text-center text-sm pt-4 text-gray-500">
            Point your webcam at a barcode...
          </p>
        )}
      </div>

      <p className="mx-5">
        <span className="text-xs font-medium">Last result: {result}</span>
      </p>
    </div>
  );
};

export default Scanner;
