import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/utils/axiosClient";

// Define the type for a single medical record
export interface MedicalRecord {
  id: number;
  petId: number;
  title: string;
  date: string;
  userDetails?: string;
  hospitalDetails?: string;
  photos: { imageData: string; uploadedBy: "user" | "hospital" }[];
}

interface MedicalState {
  loading: boolean;
  error: string | null;
  records: MedicalRecord[];
}

const initialState: MedicalState = {
  loading: false,
  error: null,
  records: [],
};
// Mapper: API -> MedicalRecord
const mapApiToMedicalRecord = (item: any): MedicalRecord => ({
  id: item.id,
  petId: item.pet_id,
  title: item.title,
  date: item.date,
  userDetails: item.user_details || undefined,
  hospitalDetails: item.hospital_details || undefined,
  photos:
    item.photos?.map((p: any) => ({
      imageData: p.imageData,
      uploadedBy: p.uploadedBy,
    })) || [],
});

// Async Thunks
export const fetchMedicalRecords = createAsyncThunk(
  "medical/fetchRecords",
  async (_, thunkAPI) => {
    try {
      const response = await axiosClient.get("/medical-records");
      return response.data.map((item: any) => mapApiToMedicalRecord(item));
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const createMedicalRecord = createAsyncThunk(
  "medical/createRecord",
  async (recordData: Omit<MedicalRecord, "id">, thunkAPI) => {
    try {
      const response = await axiosClient.post("/medical-records", recordData);
      return response.data as MedicalRecord;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  "medical/updateRecord",
  async (recordData: MedicalRecord, thunkAPI) => {
    try {
      const { id, ...data } = recordData;
      const response = await axiosClient.put(`/medical-records/${id}`, data);
      return response.data as MedicalRecord;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  "medical/deleteRecord",
  async (recordId: number, thunkAPI) => {
    try {
      await axiosClient.delete(`/medical-records/${recordId}`);
      return recordId;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const medicalSlice = createSlice({
  name: "medical",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMedicalRecords.fulfilled,
        (state, action: PayloadAction<MedicalRecord[]>) => {
          state.loading = false;
          state.records = action.payload;
        }
      )
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createMedicalRecord.fulfilled,
        (state, action: PayloadAction<MedicalRecord>) => {
          state.loading = false;
          state.records.push(action.payload);
        }
      )
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateMedicalRecord.fulfilled,
        (state, action: PayloadAction<MedicalRecord>) => {
          state.loading = false;
          const index = state.records.findIndex(
            (r) => r.id === action.payload.id
          );
          if (index !== -1) {
            state.records[index] = action.payload;
          }
        }
      )
      .addCase(updateMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteMedicalRecord.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.loading = false;
          state.records = state.records.filter((r) => r.id !== action.payload);
        }
      )
      .addCase(deleteMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default medicalSlice.reducer;
