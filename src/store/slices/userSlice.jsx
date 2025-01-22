import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { profile: null, selStore: import.meta.env.VITE_USER_STORE_NAME, selRegion: "Chandigarh" },
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    setStoreFilter: (state, action) => {
      state.selRegion = action.payload.selRegion || "";
      state.selStore = action.payload.selStore || "";
    },
  },
});

export const { setUserProfile, setStoreFilter } = userSlice.actions;

export default userSlice.reducer;
