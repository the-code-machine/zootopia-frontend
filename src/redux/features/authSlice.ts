import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  email: string;
  otp: string;
}

const initialState: AuthState = {
  email: "",
  otp: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail(state, action: PayloadAction<string>){
        state.email = action.payload;
    },
    clearEmail(state) {
      state.email = "";
    },
    setOtp(state, action: PayloadAction<string>) {
      state.otp = action.payload;
    },
    clearOtp(state) {
      state.otp = "";
    },
  },
});

export const { setEmail, clearEmail, setOtp, clearOtp } = authSlice.actions;
export default authSlice.reducer;