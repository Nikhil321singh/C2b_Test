import { createSlice } from "@reduxjs/toolkit";

const responseSlice = createSlice({
  name: "responseData",
  initialState: {
    id: "",
    price: 0,
    grade: "",
  },

  reducers: {
    setResponseData: (state, action) => {
      const { id, price, grade } = action.payload;
      state.id = id;
      state.price = price;
      state.grade = grade;
    },
  },
});

export const { setResponseData } = responseSlice.actions;
export default responseSlice.reducer;
