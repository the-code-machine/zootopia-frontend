import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient";

// Define the type for a single history entry
export interface VaccineHistory {
  id: number;
  vaccineId: number;
  petId: number;
  treatmentInfo: string;
  dateAdministered: string;
  photos: { type: string; url: string }[];
}

interface VaccineHistoryState {
  loading: boolean;
  error: string | null;
  histories: { [vaccineId: number]: VaccineHistory[] }; // Store histories keyed by vaccineId
}

const initialState: VaccineHistoryState = {
  loading: false,
  error: null,
  histories: {},
};
// Mapper to convert API response to VaccineHistory type
const mapApiToVaccineHistory = (item: any): VaccineHistory => ({
  id: item.id,
  vaccineId: item.vaccine_id,
  petId: item.pet_id,
  treatmentInfo: item.treatment_info,
  dateAdministered: item.date_administered,
  photos: item.photos || [],
});

export const fetchVaccineHistory = createAsyncThunk(
  "vaccineHistory/fetchHistory",
  async (vaccineId: number, thunkAPI) => {
    try {
      const response = await axiosClient.get(`/vaccines/${vaccineId}/history`);
      return {
        vaccineId,
        data: response.data.map((item: any) => mapApiToVaccineHistory(item)),
      };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const createVaccineHistory = createAsyncThunk(
  "vaccineHistory/createHistory",
  async (historyData: Omit<VaccineHistory, "id">, thunkAPI) => {
    try {
      const { vaccineId, ...data } = historyData;
      const response = await axiosClient.post(
        `/vaccines/${vaccineId}/history`,
        data
      );
      return response.data as VaccineHistory;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateVaccineHistory = createAsyncThunk(
  "vaccineHistory/updateHistory",
  async (historyData: VaccineHistory, thunkAPI) => {
    try {
      const { id, vaccineId, ...data } = historyData;
      const response = await axiosClient.put(
        `/vaccines/${vaccineId}/history/${id}`,
        data
      );
      return response.data as VaccineHistory;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteVaccineHistory = createAsyncThunk(
  "vaccineHistory/deleteHistory",
  async (
    { vaccineId, historyId }: { vaccineId: number; historyId: number },
    thunkAPI
  ) => {
    try {
      await axiosClient.delete(`/vaccines/${vaccineId}/history/${historyId}`);
      return { vaccineId, historyId };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const vaccineHistorySlice = createSlice({
  name: "vaccineHistory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVaccineHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVaccineHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.histories[action.payload.vaccineId] = action.payload.data;
      })
      .addCase(fetchVaccineHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(
        createVaccineHistory.fulfilled,
        (state, action: PayloadAction<VaccineHistory>) => {
          const { vaccineId } = action.payload;
          if (!state.histories[vaccineId]) {
            state.histories[vaccineId] = [];
          }
          state.histories[vaccineId].push(action.payload);
        }
      )
      // Update
      .addCase(
        updateVaccineHistory.fulfilled,
        (state, action: PayloadAction<VaccineHistory>) => {
          const { vaccineId, id } = action.payload;
          const histories = state.histories[vaccineId];
          if (histories) {
            const index = histories.findIndex((h) => h.id === id);
            if (index !== -1) {
              histories[index] = action.payload;
            }
          }
        }
      )
      // Delete
      .addCase(deleteVaccineHistory.fulfilled, (state, action) => {
        const { vaccineId, historyId } = action.payload;
        const histories = state.histories[vaccineId];
        if (histories) {
          state.histories[vaccineId] = histories.filter(
            (h) => h.id !== historyId
          );
        }
      })
      // Handle loading/error for mutations
      .addMatcher(
        (action) =>
          [
            createVaccineHistory.pending,
            updateVaccineHistory.pending,
            deleteVaccineHistory.pending,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [
            createVaccineHistory.rejected,
            updateVaccineHistory.rejected,
            deleteVaccineHistory.rejected,
            createVaccineHistory.fulfilled,
            updateVaccineHistory.fulfilled,
            deleteVaccineHistory.fulfilled,
          ].includes(action.type),
        (state, action: any) => {
          state.loading = false;
          if (action.type.endsWith("rejected")) {
            state.error = action.payload as string;
          }
        }
      );
  },
});

export default vaccineHistorySlice.reducer;
