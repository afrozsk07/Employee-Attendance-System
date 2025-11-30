import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const getEmployeeDashboard = createAsyncThunk(
  'dashboard/employee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/employee');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const getManagerDashboard = createAsyncThunk(
  'dashboard/manager',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/manager');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const getBestEmployees = createAsyncThunk(
  'dashboard/getBestEmployees',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await api.get('/dashboard/best-employees', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch best employees');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    employeeData: null,
    managerData: null,
    bestEmployees: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployeeDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeData = action.payload;
      })
      .addCase(getEmployeeDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getManagerDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.managerData = action.payload;
      })
      .addCase(getManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBestEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBestEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.bestEmployees = action.payload;
      })
      .addCase(getBestEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

