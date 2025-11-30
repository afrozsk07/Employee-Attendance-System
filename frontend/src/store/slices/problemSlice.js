import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Submit problem report
export const submitProblem = createAsyncThunk(
  'problem/submit',
  async (problemData, { rejectWithValue }) => {
    try {
      const response = await api.post('/problem/report', problemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit problem report');
    }
  }
);

// Get my reports
export const getMyReports = createAsyncThunk(
  'problem/getMyReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/problem/my-reports');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

// Get all reports (Manager)
export const getAllReports = createAsyncThunk(
  'problem/getAllReports',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.category) params.append('category', filters.category);
      const response = await api.get(`/problem/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

// Resolve problem
export const resolveProblem = createAsyncThunk(
  'problem/resolve',
  async ({ id, resolution, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/problem/${id}/resolve`, { resolution, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve problem');
    }
  }
);

// Update problem status
export const updateProblemStatus = createAsyncThunk(
  'problem/updateStatus',
  async ({ id, status, resolution }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/problem/${id}/update-status`, { status, resolution });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const problemSlice = createSlice({
  name: 'problem',
  initialState: {
    reports: [],
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit problem
      .addCase(submitProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(submitProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get my reports
      .addCase(getMyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
      })
      .addCase(getMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all reports
      .addCase(getAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
      })
      .addCase(getAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resolve problem
      .addCase(resolveProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const index = state.reports.findIndex(r => r._id === action.payload.report.id);
        if (index !== -1) {
          state.reports[index].status = action.payload.report.status;
          state.reports[index].resolution = action.payload.report.resolution;
        }
      })
      .addCase(resolveProblem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateProblemStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProblemStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const index = state.reports.findIndex(r => r._id === action.payload.report.id);
        if (index !== -1) {
          state.reports[index].status = action.payload.report.status;
        }
      })
      .addCase(updateProblemStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessage } = problemSlice.actions;
export default problemSlice.reducer;

