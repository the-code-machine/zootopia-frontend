// src/store/userSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  state: string;
  totalSpent: string;
  ordersCount: number;
  tags: string;
}

interface UserState {
  profile: UserProfile | null;
}

const initialState: UserState = {
  profile: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
    updateUserEmail: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.email = action.payload;
      }
    },
    updateUserPhone: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.phone = action.payload;
      }
    },
  },
});

export const {
  setUserProfile,
  clearUserProfile,
  updateUserEmail,
  updateUserPhone,
} = userSlice.actions;
export default userSlice.reducer;
