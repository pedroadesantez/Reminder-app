import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'planner',
    calendarView: 'month', // day, week, month
    selectedDate: new Date().toISOString().split('T')[0],
    showCompletedTasks: true,
    isVoiceInputActive: false,
    modalVisible: false,
    modalType: null, // 'createTask', 'editTask', 'taskDetail', 'settings'
    selectedTask: null,
    searchQuery: '',
    sortOrder: 'desc', // asc, desc
    filterCategory: 'all',
    streakModalVisible: false,
    onboardingStep: 0,
    hasCompletedOnboarding: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setCalendarView: (state, action) => {
      state.calendarView = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    toggleCompletedTasks: (state) => {
      state.showCompletedTasks = !state.showCompletedTasks;
    },
    setVoiceInputActive: (state, action) => {
      state.isVoiceInputActive = action.payload;
    },
    showModal: (state, action) => {
      state.modalVisible = true;
      state.modalType = action.payload.type;
      state.selectedTask = action.payload.task || null;
    },
    hideModal: (state) => {
      state.modalVisible = false;
      state.modalType = null;
      state.selectedTask = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    showStreakModal: (state) => {
      state.streakModalVisible = true;
    },
    hideStreakModal: (state) => {
      state.streakModalVisible = false;
    },
    setOnboardingStep: (state, action) => {
      state.onboardingStep = action.payload;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
      state.onboardingStep = 0;
    },
  },
});

export const {
  setActiveTab,
  setCalendarView,
  setSelectedDate,
  toggleCompletedTasks,
  setVoiceInputActive,
  showModal,
  hideModal,
  setSearchQuery,
  setSortOrder,
  setFilterCategory,
  showStreakModal,
  hideStreakModal,
  setOnboardingStep,
  completeOnboarding,
} = uiSlice.actions;

export default uiSlice.reducer;