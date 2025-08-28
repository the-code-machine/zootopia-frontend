import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient";

// Define the type for a single vaccine record
export interface Vaccine {
  id: number;
  petId: number;
  vaccineType: string;
  vaccineName: string;
  vaccinationDate: string;
  numberOfVaccinations?: number;
  dueDate?: string;
  veterinarian?: string;
  notes?: string;
  images?: string[];
}

interface VaccineState {
  loading: boolean;
  error: string | null;
  vaccines: Vaccine[];
}

const initialState: VaccineState = {
  loading: false,
  error: null,
  vaccines: [],
};

// Mapper: API -> Vaccine
const mapApiToVaccine = (item: any): Vaccine => ({
  id: item.id,
  petId: item.pet_id,
  vaccineType: item.vaccine_type,
  vaccineName: item.vaccine_name,
  vaccinationDate: item.vaccination_date,
  numberOfVaccinations: item.number_of_vaccinations,
  dueDate: item.vaccination_date, // Assuming due date is same as vaccination date for now
  veterinarian: item.veterinarian,
  notes: item.notes,
  images: item.images || [],
});

// Async Thunks
export const fetchVaccines = createAsyncThunk(
  "vaccines/fetchVaccines",
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get("/vaccines");
      return response.data.map((item: any) => mapApiToVaccine(item));
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
export const createVaccine = createAsyncThunk(
  "vaccines/createVaccine",
  async (vaccineData: Omit<Vaccine, "id">, thunkAPI) => {
    try {
      const response = await axiosClient.post("/vaccines", vaccineData);
      return response.data as Vaccine;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateVaccine = createAsyncThunk(
  "vaccines/updateVaccine",
  async (vaccineData: Vaccine, thunkAPI) => {
    try {
      const { id, ...data } = vaccineData;
      const response = await axiosClient.put(`/vaccines/${id}`, data);
      return response.data as Vaccine;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteVaccine = createAsyncThunk(
  "vaccines/deleteVaccine",
  async (vaccineId: number, thunkAPI) => {
    try {
      await axiosClient.delete(`/vaccines/${vaccineId}`);
      return vaccineId;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const vaccineSlice = createSlice({
  name: "vaccine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVaccines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVaccines.fulfilled,
        (state, action: PayloadAction<Vaccine[]>) => {
          state.loading = false;
          state.vaccines = action.payload;
        }
      )
      .addCase(fetchVaccines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createVaccine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createVaccine.fulfilled,
        (state, action: PayloadAction<Vaccine>) => {
          state.loading = false;
          state.vaccines.push(action.payload);
        }
      )
      .addCase(createVaccine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateVaccine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateVaccine.fulfilled,
        (state, action: PayloadAction<Vaccine>) => {
          state.loading = false;
          const index = state.vaccines.findIndex(
            (v) => v.id === action.payload.id
          );
          if (index !== -1) {
            state.vaccines[index] = action.payload;
          }
        }
      )
      .addCase(updateVaccine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteVaccine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteVaccine.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.vaccines = state.vaccines.filter(
            (v) => v.id !== action.payload
          );
        }
      )
      .addCase(deleteVaccine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default vaccineSlice.reducer;
