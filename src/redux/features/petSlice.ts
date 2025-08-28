// store/slices/petSlice.ts
import axiosClient from "@/utils/axiosClient";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define Pet type
export interface Pet {
  id: string;
  type: string;
  name: string;
  gender: string;
  is_neutered: boolean;
  breed: string;
  birthday: string;
  image?: string;
}

interface PetState {
  pets: Pet[];
  loading: boolean;
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  loading: false,
  error: null,
};

// ✅ Thunk: Register a new pet
export const registerPet = createAsyncThunk<
  Pet,
  Partial<Pet>,
  { rejectValue: string }
>("pet/registerPet", async (petData, thunkAPI) => {
  try {
    const response = await axiosClient.post("/pet", petData);
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Failed to register pet"
    );
  }
});

// ✅ Thunk: Fetch all pets
export const fetchPets = createAsyncThunk<Pet[], void, { rejectValue: string }>(
  "pet/fetchPets",
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get("/pet");
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch pets"
      );
    }
  }
);

const petSlice = createSlice({
  name: "pet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register pet
      .addCase(registerPet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPet.fulfilled, (state, action: PayloadAction<Pet>) => {
        state.loading = false;
        state.pets.push(action.payload);
      })
      .addCase(registerPet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to register pet";
      })

      // Fetch pets
      .addCase(fetchPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action: PayloadAction<Pet[]>) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch pets";
      });
  },
});

export default petSlice.reducer;
