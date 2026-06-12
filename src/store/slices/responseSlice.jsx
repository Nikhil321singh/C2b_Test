import { createSlice } from "@reduxjs/toolkit";

const responseSlice = createSlice({
  name: "responseData",
  initialState: {
    id: "",
    price: 0,
    grade: "",
    uniqueCode: "",
    bonus: 0,
    slabBonusAmount: 0,
    slabApplied: "",
    exactValue: 0,
    dynamicPricingEnabled: false,
    conversionFee: 10,
    mode: 'bonus',
    couponCode: '',
    name: "",
    email: "",
    phone: "",
  },

  reducers: {
    setResponseData: (state, action) => {
      const { id, price, grade, uniqueCode, bonus, slabBonusAmount, slabApplied, exactValue, dynamicPricingEnabled, conversionFee, mode, couponCode } = action.payload;
      state.id = id;
      state.price = price;
      state.grade = grade;
      state.uniqueCode = uniqueCode;
      state.bonus = bonus ?? 0;
      state.slabBonusAmount = slabBonusAmount ?? 0;
      state.slabApplied = slabApplied ?? "";
      state.exactValue = exactValue ?? price ?? 0;
      state.dynamicPricingEnabled = dynamicPricingEnabled ?? false;
      state.conversionFee = conversionFee ?? 10;
      state.mode = mode ?? 'bonus';
      state.couponCode = couponCode ?? '';
    },
    setLeadOTPData: (state, action) => {
      const { name, email, phone } = action.payload;
      state.name = name;
      state.email = email;
      state.phone = phone;
    },
  },
});

export const { setResponseData, setLeadOTPData } = responseSlice.actions;
export default responseSlice.reducer;
