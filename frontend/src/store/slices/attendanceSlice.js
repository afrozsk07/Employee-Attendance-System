import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkin');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkout');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today status');
    }
  }
);

export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await api.get('/attendance/my-history', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await api.get('/attendance/my-summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/all', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await api.get('/attendance/summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team summary');
    }
  }
);

export const getTodayStatusAll = createAsyncThunk(
  'attendance/getTodayStatusAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today-status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today status');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayStatus: null,
    myHistory: [],
    mySummary: null,
    allAttendance: [],
    teamSummary: null,
    todayStatusAll: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttendance: (state) => {
      state.todayStatus = null;
      state.myHistory = [];
      state.mySummary = null;
      state.allAttendance = [];
      state.teamSummary = null;
      state.todayStatusAll = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload.attendance;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload.attendance;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Today Status
      .addCase(getTodayStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload.attendance;
      })
      .addCase(getTodayStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My History
      .addCase(getMyHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.myHistory = action.payload.attendance;
      })
      .addCase(getMyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Summary
      .addCase(getMySummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.mySummary = action.payload;
      })
      .addCase(getMySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.attendance;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Team Summary
      .addCase(getTeamSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeamSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.teamSummary = action.payload;
      })
      .addCase(getTeamSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Today Status All
      .addCase(getTodayStatusAll.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayStatusAll.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatusAll = action.payload;
      })
      .addCase(getTodayStatusAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;

