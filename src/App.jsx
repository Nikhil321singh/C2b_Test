import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import SelectBrand from "./pages/SelectBrand";
import InputNumber from "./pages/InputNumber";
import DeviceDetails from "./pages/DeviceDetails";
import Login from "./pages/Login";
import DeviceInformation from "./pages/DeviceInformation";
import PricePage from "./pages/Price";
import PhoneSelect from "./pages/PhoneSelect";
import { Provider } from "react-redux";
import store from "./store/store";
import Register from "./pages/Register";
import { AnswerProvider } from "./components/AnswerContext";
import { QuestionProvider } from "./components/QuestionContext";
import CustomerFormDetails from "./components/CustomerFormDetails";
import CustomerTable from "./pages/CustomerTable";
import OTPpage from "./pages/OTP_page";
import SpecialOffers from "./pages/SpecialOffers";
import PurchaseReceipt from "./components/Reciept";
import AdminHome from "./pages/AdminHome";
import AdminFinalGrade from "./pages/AdminFinalGrade";
import GradePricingSheet from "./pages/GradePricingSheet";
import AdminLogin from "./pages/AdminLogin";
import SelectDeviceType from "./pages/SelectDeviceType/SelectDeviceType";
import SelectDevice from "./pages/SelectDevice/SelectDevice";
import SelectModel from "./pages/SelectModel/SelectModel";
import PasswordRecovery from "./pages/ForgetPassword";
import DeviceQuote from "./pages/DeviceQuote.jsx/DeviceQuote";
import NewDeviceqs from "./pages/DeviceDetailnew/NewDeviceqs";
import ProductSold from "./pages/ProductSold";
function App() {
  return (
    <>
      <AnswerProvider>
        <QuestionProvider>
          <Provider store={store}>
            <Router>
              <Routes>
                <Route path="/selectPhone" element={<SelectBrand />}></Route>
                <Route path="/devicedetail" element={<DeviceDetails />}></Route>

                <Route
                  path="/deviceinfo"
                  element={<DeviceInformation />}
                ></Route>

                <Route path="/inputnumber" element={<InputNumber />} />
                <Route path="/phone" element={<PhoneSelect />}></Route>

                <Route path="/" element={<Login />}></Route>

                <Route path="/register" element={<Register />}></Route>
                <Route path="/adminlogin" element={<AdminLogin />}></Route>
                {/* <Route path="/otp/verification" element={<OTPpage />}></Route> */}

                <Route
                  path="/customertable"
                  element={<CustomerTable />}
                ></Route>
                <Route path="/adminhome" element={<AdminHome />}></Route>
                <Route
                  path="/adminfinalgrade"
                  element={<AdminFinalGrade />}
                ></Route>
                <Route
                  path="/gradepricingsheet"
                  element={<GradePricingSheet />}
                ></Route>
                <Route
                  path="/specialoffers"
                  element={<SpecialOffers />}
                ></Route>
                <Route path="/Reciept" element={<PurchaseReceipt />}></Route>
                <Route path="/pricepage" element={<PricePage />}></Route>
                <Route
                  path="/selectdevicetype"
                  element={<SelectDeviceType />}
                ></Route>
                <Route
                  path="/selectdevice/:brandId"
                  element={<SelectDevice />}
                ></Route>
                <Route path="/selectmodel" element={<SelectModel />}></Route>
                <Route path="/devicequote" element={<DeviceQuote />}></Route>
                <Route
                  path="/PasswordRecovery"
                  element={<PasswordRecovery />}
                ></Route>
                <Route
                  path="/device/Qestions"
                  element={<NewDeviceqs />}
                ></Route>
                <Route path="/productsold" element={<ProductSold />}></Route>
              </Routes>
            </Router>
          </Provider>
        </QuestionProvider>
      </AnswerProvider>
    </>
  );
}

export default App;
