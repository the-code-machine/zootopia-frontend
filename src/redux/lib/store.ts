import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import userReducer from "../features/userSlice";
import petReducer from "../features/petSlice";
import appointmentReducer from "../features/appointmentSlice";
import vaccineReducer from "../features/vaccineslice";
import vaccineHistoryReducer from "../features/vaccineHistory";
import medicalReducer from "../features/medicalSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      pet: petReducer,
      appointment: appointmentReducer, // Corrected typo from 'appoitnment'
      vaccine: vaccineReducer,
      vaccineHistory: vaccineHistoryReducer,
      medical: medicalReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
