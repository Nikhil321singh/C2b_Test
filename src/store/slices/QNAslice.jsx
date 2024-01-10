import { createSlice } from "@reduxjs/toolkit";

// Define the initial state of your QNA object
const initialState = {
    Core: [],
    Cosmetics: [],
    Display: [],
    Functional_major: [],
    Functional_minor: [],
    Warranty: []
  };
  
  // Create a slice for the QNA object
  const qnaSlice = createSlice({
    name: 'QNA',
    initialState,
    reducers: {
      setGroupAnswers: (state, action) => {
        const { group, answers } = action.payload;
        state[group] = answers;
      },
      updateCoreObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Core[index]) {
          state.Core[index].answer = newAnswer;
          state.Core[index].key = newKey;
        }
      },
      updateCosmeticsObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Cosmetics[index]) {
          state.Cosmetics[index].answer = newAnswer;
          state.Cosmetics[index].key = newKey;
        }
      },
      updateDisplayObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Display[index]) {
          state.Display[index].answer = newAnswer;
          state.Display[index].key = newKey;
        }
      },
      updateFunctionalMajorObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Functional_major[index]) {
          state.Functional_major[index].answer = newAnswer;
          state.Functional_major[index].key = newKey;
        }
      },
      updateFunctionalMinorObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Functional_minor[index]) {
          state.Functional_minor[index].answer = newAnswer;
          state.Functional_minor[index].key = newKey;
        }
      },
      updateWarrantyObject: (state, action) => {
        const { index, newAnswer, newKey } = action.payload;
        if (state.Warranty[index]) {
          state.Warranty[index].answer = newAnswer;
          state.Warranty[index].key = newKey;
        }
      },
    }
  });
  
  export const { 
    setGroupAnswers, 
    updateCoreObject, 
    updateCosmeticsObject, 
    updateDisplayObject, 
    updateFunctionalMajorObject, 
    updateFunctionalMinorObject, 
    updateWarrantyObject 
  } = qnaSlice.actions;

  export default qnaSlice.reducer;


  
