import React, { useState, useEffect } from "react";
import styles from "./StoreListing.module.css";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import PropTypes from "prop-types";
import PayoutFieldHelp from "../../components/PayoutFieldHelp/PayoutFieldHelp";

const succTextColor = "text-green-500";
const failTextColor = "text-primary";

const initStoreForm = {
  storeName: "",
  region: "",
  email: "",
  contactNumber: "",
  address: "",
  companyId: "",
  payoutSettings: {
    enabled: false,
    mode: "MANUAL",
    approvalEnabled: false,
    approvalThreshold: 0,
    payoutCeiling: 0,
    customerLinkExpiryMinutes: 30,
  },
};

const StoreListing = () => {
  const token = sessionStorage.getItem("authToken");
  const [sideMenu, setsideMenu] = useState(false);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initStoreForm);
  const [errMsg, setErrMsg] = useState("");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`,
          {
            headers: { Authorization: token }
          }
        );
        setCompanies(response.data.result || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();

    if (!formData.companyId) {
      setErrMsg("Please select a company");
      setFailBox(true);
      return;
    }

    setIsTableLoaded(true);
    const data = {
      storeName: formData.storeName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      region: formData.region,
      address: formData.address,
      companyId: formData.companyId,
      payoutSettings: {
        ...formData.payoutSettings,
        approvalThreshold: Number(
          formData.payoutSettings.approvalThreshold || 0
        ),
        payoutCeiling: Number(
          formData.payoutSettings.payoutCeiling || 0
        ),
        customerLinkExpiryMinutes: Number(
          formData.payoutSettings.customerLinkExpiryMinutes || 30
        ),
      },
    };
    const config = {
      method: "post",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/create`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        setErrMsg("Successfully added new store");
        setSucBox(true);
        setIsTableLoaded(false);
        navigate("/storelistingtable");
      })
      .catch((error) => {
        setErrMsg("Failed to add store");
        setIsTableLoaded(false);
        setFailBox(true);
      });
  };

  return (
    <div className="min-h-screen bg-[#F5F4F9] pb-8">
      <div className="navbar">
        <AdminNavbar sideMenu={sideMenu} setsideMenu={setsideMenu} />
        <SideMenu sideMenu={sideMenu} setsideMenu={setsideMenu} />
      </div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full bg-black bg-opacity-50 h-full">
          <BeatLoader color="var(--primary-color)" size={15} loading={isTableLoaded} />
        </div>
      )}
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center h-full bg-black bg-opacity-50 w-full">
          <div
            className={`${styles.err_mod_box} ${
              sucBox ? succTextColor : failTextColor
            }`}
          >
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={sucBox ? succTextColor : failTextColor}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={sucBox ? succTextColor : failTextColor}
                size={90}
              />
            )}
            <h6 className={sucBox ? succTextColor : failTextColor}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={
                sucBox ? "bg-green-500 text-white" : "bg-primary text-white"
              }
            >
              Okay
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="items-center bg-white w-full max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col px-4 md:px-8"
      >
  <div className="flex flex-col w-full">
  <div className="mb-6 flex flex-col gap-2 border-b-2 pb-2 px-4 md:px-10">
  <p className="text-4xl font-bold">Store Listing</p>
            <p className="text-lg">All fields marked with * are required</p>
          </div>
          <div className="flex flex-wrap gap-2 px-4 md:px-10 mb-10">
          <button
              onClick={() => navigate("/storelistingtable")}
              className="font-medium text-sm text-white p-3 rounded bg-primary"
            >
              View Detail
            </button>
          </div>
          <StoreListingForm
            submitHandler={submitHandler}
            formData={formData}
            handleChange={handleChange}
            companies={companies}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  );
};

const CompanySelect = ({ formData, handleChange, companies }) => (
  <div className="flex flex-col gap-2 w-full md:w-[70%]">
    <span className="text-xl font-medium">Company*</span>
    <select
      id="companyId"
      value={formData.companyId}
      name="companyId"
      className="border-2 px-2 py-2 rounded-lg outline-none"
      onChange={handleChange}
      required={true}
    >
      <option value="">Select Company</option>
      {companies.map((company) => (
        <option key={company._id} value={company._id}>
          {company.name} ({company.companyCode})
        </option>
      ))}
    </select>
  </div>
);

CompanySelect.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  companies: PropTypes.array.isRequired,
};

const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  minLength,
}) => (
  <div className="flex flex-col gap-2 w-full md:w-[70%]">
    <span className="text-xl font-medium">{label}</span>
    <input
      id={id}
      minLength={minLength}
      name={name}
      value={value}
      onChange={onChange}
      className="border-2 px-2 py-2 rounded-lg outline-none"
      type={type}
      required={required}
    />
  </div>
);

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  minLength: PropTypes.number,
};

const PayoutSettingsSection = ({ formData, setFormData }) => {
  const updatePayout = (field, value) =>
    setFormData((currentFormData) => ({
      ...currentFormData,
      payoutSettings: {
        ...currentFormData.payoutSettings,
        [field]: value,
      },
    }));

  return (
    <div className="w-full md:w-[70%] mt-2 p-4 border border-gray-200 rounded-lg space-y-4">
      <h3 className="font-semibold text-xl">Customer Payout</h3>
      <label className="flex items-center gap-3">
        <input
          id="store-payout-enabled"
          type="checkbox"
          className="h-5 w-5 cursor-pointer accent-[var(--primary-color)]"
          checked={Boolean(formData.payoutSettings.enabled)}
          onChange={(event) => updatePayout("enabled", event.target.checked)}
        />
        Enable payout configuration
      </label>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Payment mode</label>
        <select
          className="border-2 px-3 py-2 rounded-lg"
          value={formData.payoutSettings.mode}
          onChange={(event) => updatePayout("mode", event.target.value)}
        >
          <option value="MANUAL">Manual payment</option>
          <option value="HSBC_UPI">HSBC UPI payout</option>
          <option value="HSBC_IMPS">HSBC IMPS (bank transfer)</option>
          <option value="HSBC_NEFT">HSBC NEFT (bank transfer)</option>
        </select>
      </div>
      <label className="flex items-center gap-3">
        <input
          id="store-payout-approval-enabled"
          type="checkbox"
          className="h-5 w-5 cursor-pointer accent-[var(--primary-color)]"
          checked={Boolean(formData.payoutSettings.approvalEnabled)}
          onChange={(event) =>
            updatePayout("approvalEnabled", event.target.checked)
          }
        />
        Require approval above configured amount
      </label>
      <div className="flex flex-col gap-2">
        <label className="font-medium">
          <PayoutFieldHelp label="Store payout ceiling (₹)" field="payoutCeiling" />
        </label>
        <input
          className="border-2 px-3 py-2 rounded-lg"
          type="number"
          min="0"
          step="0.01"
          value={formData.payoutSettings.payoutCeiling}
          onChange={(event) => updatePayout("payoutCeiling", event.target.value)}
        />
        <p className="text-sm text-gray-500">
          Use 0 for no ceiling. Payouts above a configured ceiling are
          blocked before the customer link is created.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium">
          <PayoutFieldHelp label="Approval amount (₹)" field="approvalThreshold" />
        </label>
        <input
          className="border-2 px-3 py-2 rounded-lg"
          type="number"
          min="0"
          step="0.01"
          value={formData.payoutSettings.approvalThreshold}
          onChange={(event) =>
            updatePayout("approvalThreshold", event.target.value)
          }
        />
        <p className="text-sm text-gray-500">
          Use 0 to require approval for every HSBC payout.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium">
          <PayoutFieldHelp
            label="Customer link expiry (minutes)"
            field="customerLinkExpiryMinutes"
          />
        </label>
        <input
          className="border-2 px-3 py-2 rounded-lg"
          type="number"
          min="5"
          max="1440"
          value={formData.payoutSettings.customerLinkExpiryMinutes}
          onChange={(event) =>
            updatePayout("customerLinkExpiryMinutes", event.target.value)
          }
        />
      </div>
    </div>
  );
};

PayoutSettingsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

const StoreListingForm = ({
  submitHandler,
  formData,
  handleChange,
  companies,
  setFormData,
}) => (
  <form onSubmit={submitHandler} className="flex flex-col gap-4 px-4 md:px-10">
    <CompanySelect
      formData={formData}
      handleChange={handleChange}
      companies={companies}
    />
    <FormField
      id="storeName"
      label="Store Name*"
      name="storeName"
      value={formData.storeName}
      onChange={handleChange}
      type="text"
      required
    />
    <FormField
      id="email"
      label="Email*"
      name="email"
      value={formData.email}
      onChange={handleChange}
      type="email"
      minLength={6}
      required
    />
    <FormField
      id="contactNumber"
      label="Contact Number*"
      name="contactNumber"
      value={formData.contactNumber}
      onChange={handleChange}
      type="number"
      minLength={10}
      required
    />
    <FormField
      id="region"
      label="Region*"
      name="region"
      value={formData.region}
      onChange={handleChange}
      type="text"
      required
    />
    <FormField
      id="address"
      label="Adddress*"
      name="address"
      value={formData.address}
      onChange={handleChange}
      type="text"
      required
    />
    <PayoutSettingsSection formData={formData} setFormData={setFormData} />
    <div className="mt-8">
      <button
        type="submit"
        className="font-medium text-sm text-white p-3 rounded bg-primary"
      >
        Submit Form
      </button>
    </div>
  </form>
);

StoreListingForm.propTypes = {
  submitHandler: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  companies: PropTypes.array.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default StoreListing;
