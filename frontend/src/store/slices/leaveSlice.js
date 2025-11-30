import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Apply for leave
export const applyLeave = createAsyncThunk(
  'leave/apply',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leave/apply', leaveData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply for leave');
    }
  }
);

// Get my leaves
export const getMyLeaves = createAsyncThunk(
  'leave/getMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leave/my-leaves');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

// Get all leaves (Manager)
export const getAllLeaves = createAsyncThunk(
  'leave/getAllLeaves',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await api.get(`/leave/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

// Approve leave
export const approveLeave = createAsyncThunk(
  'leave/approve',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leave/${id}/approve`, { comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve leave');
    }
  }
);

// Reject leave
export const rejectLeave = createAsyncThunk(
  'leave/reject',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leave/${id}/reject`, { comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject leave');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    leaves: [],
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
      // Apply leave
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get my leaves
      .addCase(getMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload.leaves;
      })
      .addCase(getMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all leaves
      .addCase(getAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload.leaves;
      })
      .addCase(getAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve leave
      .addCase(approveLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const index = state.leaves.findIndex(l => l._id === action.payload.leave.id);
        if (index !== -1) {
          state.leaves[index].status = 'approved';
          state.leaves[index].reviewComment = action.payload.leave.reviewComment;
        }
      })
      .addCase(approveLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject leave
      .addCase(rejectLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const index = state.leaves.findIndex(l => l._id === action.payload.leave.id);
        if (index !== -1) {
          state.leaves[index].status = 'rejected';
          state.leaves[index].reviewComment = action.payload.leave.reviewComment;
        }
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessage } = leaveSlice.actions;
export default leaveSlice.reducer;

