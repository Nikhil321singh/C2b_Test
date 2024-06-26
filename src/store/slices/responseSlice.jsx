import { createSlice } from "@reduxjs/toolkit";

const responseSlice = createSlice({
  name: "responseData",
  initialState: {
    id: "",
    price: 0,
    grade: "",
    uniqueCode: "",
  },

  reducers: {
    setResponseData: (state, action) => {
      const { id, price, grade, uniqueCode } = action.payload;
      state.id = id;
      state.price = price;
      state.grade = grade;
      state.uniqueCode = uniqueCode;
    },
  },
});

export const { setResponseData } = responseSlice.actions;
export default responseSlice.reducer;
