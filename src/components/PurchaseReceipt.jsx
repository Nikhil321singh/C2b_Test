import React from "react";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;

const PurchaseReceipt = ({
  imeiNumber,
  uniqueCode,
  phoneNumber,
  aadharNumber,
  phoneName,
  type,
  storage,
  storeName,
  RAM,
  formattedDate,
  emailId,
  name,
  region,
  address,
  price,
}) => {
  const WEBSITE_SHORT_NAME =
    currentDomain === import.meta.env.VITE_BUYBACK_URL
      ? import.meta.env.VITE_BUYBACK_SHORT_NAME
      : import.meta.env.VITE_WEBSITE_SHORT_NAME;
  const COMPANY_EMAIL =
    currentDomain === import.meta.env.VITE_BUYBACK_URL
      ? import.meta.env.VITE_COMPANY_BUYBACK_EMAIL
      : import.meta.env.VITE_COMPANY_EMAIL;
  const maskPhoneNumber = (phNumber) => {
    const visibleLength = Math.ceil(phNumber?.length * 0.25);
    const maskedSection = phNumber?.slice(0, phNumber.length - visibleLength);
    const visibleSection = phNumber?.slice(phNumber?.length - visibleLength);
    return `${maskedSection.replace(/./g, "x")}${visibleSection}`;
  };

  const maskEmail = (email) => {
    const [namee, domain] = email.split("@");
    const visibleLength = Math.ceil(namee?.length * 0.25);
    const maskedName = namee?.slice(0, namee?.length - visibleLength);
    const visibleName = namee?.slice(namee?.length - visibleLength);
    return `${maskedName.replace(/./g, "x")}${visibleName}@${domain}`;
  };

  return (
    <div className="p-4 px-12 bg-white border-2 text-sm">
      <style>{`
       @media print {
  .page-break {
    break-before: page; /* More reliable for html2pdf */
    display: block;
    width: 100%;
  }
}`}</style>
      <div className="flex items-center justify-center bg-white p-[1vh] mx-[2vh] my-[1vh]">
        <img src={GREST_LOGO} alt="App logo" className="w-80 h-24" />
      </div>
      <div className="flex flex-col items-center justify-between mb-2">
        <p className="text-sm text-[#1b0d6c]">
          {import.meta.env.VITE_COMPANY_NAME} ,
          <span className="text-primary"> GSTIN/UIN:</span>
          {import.meta.env.VITE_COMPANY_GSTIN}
        </p>
        <p className="text-sm text-[#1b0d6c]">
          <span className="text-primary"> Address:</span>{" "}
          {import.meta.env.VITE_COMPANY_ADDRESS}
        </p>
        <p className="text-sm text-[#1b0d6c]">
          <span className="text-primary"> Contact:</span>{" "}
          {import.meta.env.VITE_COMPANY_CONTACT} ,
          <span className="text-primary"> E-mail:</span> {COMPANY_EMAIL}
        </p>
      </div>
      <div className="text-center">
        <p className="font-bold text-xl">PURCHASE RECEIPT</p>
      </div>
      <div className="flex items-center mt-4 justify-between mx-auto">
        <div className="w-[30%]">
          <p>
            <span className="font-bold"> Transaction ID:</span> {uniqueCode}
          </p>
          <p>
            <span className="font-bold"> Date:</span> {formattedDate}
          </p>
        </div>
        <div className=" p-4 border-2 border-black w-[70%]">
          <p>
            <span className="font-bold"> Purchased From: {name}</span>
          </p>
          <p></p>
          <span> Contact: {maskPhoneNumber(phoneNumber)}</span>
          <p>
            <span> Mail: {maskEmail(emailId)}</span>
          </p>
          <p>
            <span> Aadhar No.: {aadharNumber}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-8 flex-row justify-start">
        <div className="flex flex-col items-start">
          <p className="font-bold">S.No.</p>
          <p>1</p>
        </div>
        <div>
          <p className="font-bold flex flex-col items-start">ITEM</p>
          <p>
            {phoneName}
            {(() => {
              if (RAM && storage) {
                return ` (${RAM}/${storage})`;
              }
              if (RAM) {
                return ` (${RAM}/)`;
              }
              if (storage) {
                return ` (/${storage})`;
              }
              return "";
            })()}
          </p>
        </div>
        <div>
          <p className="font-bold flex flex-col items-start">PRICE</p>
          <p>{`₹ ${Math.floor(price)}/-`}</p>
        </div>
      </div>
      <div className="flex gap-8 flex-row justify-start">
        <div className="flex flex-col items-start">
          <p className="mt-4">IMEI No.:</p>
          <p className="mt-4">Serial Number(if Laptop):</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="mt-4">{type ? imeiNumber : ""}</p>
          <p className="mt-4">{type === "Laptop" ? imeiNumber : ""}</p>
        </div>
      </div>
      <hr className="border-black mt-10 border-1" />
      <div className="flex flex-col items-center border-b-2 border-dashed border-black py-4 ">
        <p className="text-xl font-bold mt-4 mb-2">Via Retail Store Partner:</p>
        <p>{storeName}</p>
        <p className="uppercase text-center">{address}</p>
        <p className="text-sm">
          This is a Computer Generated Purchase Receipt and does not require
          signature or stamp
        </p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-xl font-bold my-4">IDEMNITY BOND</p>
        <p className="text-center">
          This bond of idemnity is made and executed by :{" "}
          <span className="font-bold underline">{name}</span> Herein after
          referred to as "Seller" who has come in Retail store of{" "}
          <span className="font-bold underline">{storeName}</span> to sell
          his/her old Gadget, to the {WEBSITE_SHORT_NAME} Network herein after
          referred to as "Purchaser" which expression shall mean and include its
          representative, executors, nominee, partners, affiliates and assigns
          on day of <span className="font-bold">{formattedDate}</span>
        </p>
      </div>
      <div>
        <p className="mt-4">
          <span> Scheme Title: Buyback</span>
        </p>
        <p className="font-bold mt-16 mb-2">Seller Name and Sign</p>
      </div>
      <div className="page-break">
        <div className="terms-conditions mt-32">
          <div className="text-center mt-2">
            <p className="text-xl font-bold my-4 mx-auto">TERMS & CONDITIONS</p>
          </div>
          <div className="w-full">
            {/* START: Updated T&Cs [cite: 207-243] */}
            <div className="pl-5 text-left leading-normal">
              <div className="mb-2">
                1. RADICAL AFTERMARKET SERVICES PRIVATE LIMITED ("Grest"), a
                company incorporated under the provisions of the Companies Act,
                1956/2013, is engaged in providing aftermarket services. The
                Customer has approached Grest, expressing their intent to sell
                their gadget/device and has represented their ownership and
                authority to enter such a transaction.
              </div>
              <div className="mb-2">
                2. That the Customer represents, acknowledges and declares to
                Grest as follows:
                <div className="pl-4">
                  <div className="mb-1 mt-1">
                    a. That the Customer affirms being the legal owner or having
                    valid authorization to sell the Gadget/Device, as detailed
                    in the Application Form. In the case of an Authorized
                    Representative, they confirm full authority to act on behalf
                    of the owner and indemnify Grest against any disputes or
                    false claims arising later.
                  </div>
                  <div className="mb-1">
                    b. That the Customer declares that the Gadget/Device is not
                    involved in any legal violations, including but not limited
                    to theft, fraud, pending litigation, or government orders.
                    Any liabilities, penalties, or losses incurred by Grest due
                    to undisclosed violations shall be the Customer's sole
                    responsibility.
                  </div>
                  <div className="mb-1">
                    c. That the Customer guarantees that the Gadget/Device is
                    free from any financial, legal, or regulatory encumbrances,
                    including government dues, blacklisting, or pending taxes.
                    If any such issues arise later, the Customer shall bear all
                    related costs and expenses.
                  </div>
                  <div className="mb-1">
                    d. That the Customer confirms no loans or financial
                    liabilities restricting the transfer of ownership. If any
                    loan is later discovered and needs to be settled by Grest,
                    the Customer shall reimburse all amounts, including related
                    expenses, upon demand.
                  </div>
                  <div className="mb-1">
                    e. That the Customer confirms being the rightful owner of
                    the Gadget/Device, possessing full authority to sell it, and
                    has submitted genuine identity documents as well as the
                    Gadget/Device.
                  </div>
                  <div className="mb-1">
                    f. That the Customer acknowledges that Grest purchases the
                    Gadget/Device for resale, and all ownership rights are
                    relinquished upon delivery to Grest. Grest is free to sell
                    the Gadget/Device at any price to any third party.
                  </div>
                  <div className="mb-1">
                    g. That the Customer is solely responsible for any
                    applicable taxes, levies, or statutory payments arising from
                    the transaction.
                  </div>
                  <div className="mb-1">
                    h. That the Customer declares that no blocking or
                    restrictions have been placed on the Gadget/Device. If any
                    such restriction is identified later, the Customer must
                    immediately rectify the issue upon notice. Failure to do so
                    entitles Grest to a full refund of the purchase amount, plus
                    24% annual interest, and the right to initiate legal action.
                  </div>
                  <div className="mb-1">
                    i. If law enforcement authorities summon or investigate the
                    ownership of the Gadget/Device, the Customer agrees to
                    appear in person upon Grest's request. Any avoidance or
                    absence shall be deemed intentional misconduct, authorizing
                    Grest to file legal action, including claims for damages,
                    litigation expenses, and lawyer fees.
                  </div>
                  <div className="mb-1">
                    J. That the Customer agrees to indemnify and hold Grest and
                    any future buyer harmless from all claims, liabilities,
                    losses, damages, or risks related to the Gadget/Device
                    arising before its delivery to Grest.
                  </div>
                </div>
              </div>
              <div className="mb-2">
                3. That any misrepresentation by the Customer may lead Grest to
                take appropriate legal action, including reporting to statutory
                authorities or pursuing claims in relevant courts or tribunals.
              </div>
              <div className="mb-2">
                4. That the Customer authorizes Grest to share their personal
                information with affiliated companies and business partners for
                purposes such as transaction completion, product/service
                updates, and promotional offers.
              </div>
              <div className="mb-2">
                5. The Customer shall comply with any amendments in applicable
                laws, and Great shall not be liable for any impact arising from
                such legal changes, including resale restrictions.
              </div>
              <div className="mb-2">
                6. Grest may offer chargeable services at its discretion. If the
                Customer opts for these services, they must pay the applicable
                charges, which are non-refundable and separate from the final
                quote/offer price of the Gadget/Device.
              </div>
              <div className="mb-2">
                7. The Customer assumes full responsibility for any payments
                made by Grest as per the provided payment details. If any claim
                arises due to payment instructions given by the Customer, they
                shall indemnify and compensate Grest accordingly.
              </div>
              <div className="mb-2">
                8. If the Customer opts for payment via a voucher, they must
                activate it immediately upon receipt. Complaints regarding
                voucher activation will not be entertained after 24 hours. The
                Customer must activate the voucher in the presence of a Company
                representative.
              </div>
              <div className="mb-2">
                9. The Customer confirms that he/she has read and understood
                these terms and conditions, including in their vernacular
                language.
              </div>
              <div className="mb-2">
                10. Any disputes between the Customer and Grest shall be subject
                to the exclusive jurisdiction of the District Courts in
                Gurugram, Haryana only.
              </div>
            </div>
            {/* END: Updated T&Cs */}
          </div>
          <div className="w-full text-right mt-8">
            <p className="font-bold">SIGNATURES</p>
            <p className="font-bold mt-16">(SELLER)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceipt;
