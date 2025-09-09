import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getAll(params);
      return response.data.tasks;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.create(taskData);
      return response.data.task;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.update(taskId, updates);
      return response.data.task;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      await tasksAPI.delete(taskId);
      return taskId;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleComplete',
  async ({ taskId, completed }, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.update(taskId, { completed });
      return response.data.task;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

export const getTaskStats = createAsyncThunk(
  'tasks/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksAPI.getStats();
      return response.data.stats;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return rejectWithValue(message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    stats: null,
    isLoading: false,
    error: null,
    filter: 'all', // all, pending, completed, today, week, month
    sortBy: 'createdAt', // createdAt, dueDate, priority, title
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    reorderTasks: (state, action) => {
      state.items = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Toggle complete
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleTaskComplete.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Get stats
      .addCase(getTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getTaskStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setFilter, setSortBy, reorderTasks, clearError } = tasksSlice.actions;
export default tasksSlice.reducer;