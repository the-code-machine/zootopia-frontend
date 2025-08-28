import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AppointmentFormData } from "@/components/screens/Appointment"; // Assuming this type is defined elsewhere
import axiosClient from "@/utils/axiosClient";

interface AppointmentState {
  loading: boolean;
  error: string | null;
  appointments: AppointmentFormData[];
  selectedAppointment: AppointmentFormData | null; // To hold the details of a single appointment
}

const initialState: AppointmentState = {
  loading: false,
  error: null,
  appointments: [],
  selectedAppointment: null,
};

// Helper to map API response to frontend data structure
const mapAppointment = (apiData: any): AppointmentFormData => {
  return {
    id: String(apiData.id),
    status: apiData.status,
    date: apiData.date.split("T")[0], // Format date
    time: apiData.time,
    timeSlot: apiData.time_slot,
    numberOfPets: apiData.number_of_pets,
    pets: apiData.pets.map((p: any) => ({
      selectedPet: {
        id: String(p.id),
        name: p.name,
        type: p.type,
        gender: p.gender ?? "",
        age: p.age ?? "",
        weight: p.weight ?? "",
        is_neutered: p.is_neutered ?? false,
      },
      purposeOfVisit: p.purposeOfVisit ?? "",
      memo: p.memo ?? "",
    })),
    memberInfo: {
      firstName: apiData.member_first_name ?? "",
      lastName: apiData.member_last_name ?? "",
      phoneNumber: apiData.member_phone ?? "",
    },
    agreedToPolicy: apiData.agreed_to_policy,
  };
};

// Async thunks
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async (_, thunkAPI) => {
    try {
      const res = await axiosClient.get("/appointments");
      return res.data.map((item: any) => mapAppointment(item));
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  "appointments/fetchAppointmentById",
  async (id: string, thunkAPI) => {
    try {
      const res = await axiosClient.get(`/appointments/${id}`);
      return mapAppointment(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/createAppointment",
  async (formData: AppointmentFormData, thunkAPI) => {
    try {
      const res = await axiosClient.post("/appointments", formData);
      return mapAppointment(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  "appointments/updateAppointment",
  async (formData: AppointmentFormData, thunkAPI) => {
    try {
      const { id, ...data } = formData;
      const res = await axiosClient.put(`/appointments/${id}`, data);
      return mapAppointment(res.data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointments/deleteAppointment",
  async (id: string, thunkAPI) => {
    try {
      await axiosClient.delete(`/appointments/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch By ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
        // Also update the list if the appointment is already there
        const index = state.appointments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
        const index = state.appointments.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(
          (a) => a.id !== action.payload
        );
        if (state.selectedAppointment?.id === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default appointmentSlice.reducer;
