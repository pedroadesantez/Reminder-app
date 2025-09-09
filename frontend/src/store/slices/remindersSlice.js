import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const scheduleReminder = createAsyncThunk(
  'reminders/schedule',
  async ({ taskId, reminder }) => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.message,
        sound: true,
        vibrate: true,
      },
      trigger: {
        date: new Date(reminder.scheduledTime),
      },
    });

    const reminderData = {
      id: notificationId,
      taskId,
      ...reminder,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
    };

    // Save to local storage for offline access
    const reminders = await getStoredReminders();
    reminders.push(reminderData);
    await AsyncStorage.setItem('reminders', JSON.stringify(reminders));

    return reminderData;
  }
);

export const cancelReminder = createAsyncThunk(
  'reminders/cancel',
  async (reminderId) => {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
    
    // Remove from local storage
    const reminders = await getStoredReminders();
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));

    return reminderId;
  }
);

export const snoozeReminder = createAsyncThunk(
  'reminders/snooze',
  async ({ reminderId, snoozeMinutes }) => {
    // Cancel current reminder
    await Notifications.cancelScheduledNotificationAsync(reminderId);

    // Get reminder data
    const reminders = await getStoredReminders();
    const reminder = reminders.find(r => r.id === reminderId);

    if (reminder) {
      // Schedule new reminder with snooze time
      const newTime = new Date(Date.now() + snoozeMinutes * 60000);
      const newNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.message,
          sound: true,
          vibrate: true,
        },
        trigger: {
          date: newTime,
        },
      });

      // Update reminder data
      const updatedReminder = {
        ...reminder,
        id: newNotificationId,
        scheduledTime: newTime.toISOString(),
        snoozedCount: (reminder.snoozedCount || 0) + 1,
      };

      // Update stored reminders
      const updatedReminders = reminders.map(r => 
        r.id === reminderId ? updatedReminder : r
      );
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));

      return updatedReminder;
    }
  }
);

export const loadStoredReminders = createAsyncThunk(
  'reminders/loadStored',
  async () => {
    return await getStoredReminders();
  }
);

const getStoredReminders = async () => {
  try {
    const stored = await AsyncStorage.getItem('reminders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stored reminders:', error);
    return [];
  }
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
    permissionStatus: null,
  },
  reducers: {
    setPermissionStatus: (state, action) => {
      state.permissionStatus = action.payload;
    },
    markReminderAsTriggered: (state, action) => {
      const reminder = state.items.find(r => r.id === action.payload);
      if (reminder) {
        reminder.status = 'triggered';
        reminder.triggeredAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Schedule reminder
      .addCase(scheduleReminder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Cancel reminder
      .addCase(cancelReminder.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r.id !== action.payload);
      })
      // Snooze reminder
      .addCase(snoozeReminder.fulfilled, (state, action) => {
        const index = state.items.findIndex(r => r.id === action.meta.arg.reminderId);
        if (index !== -1) {
          state.items.splice(index, 1, action.payload);
        }
      })
      // Load stored reminders
      .addCase(loadStoredReminders.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { setPermissionStatus, markReminderAsTriggered } = remindersSlice.actions;
export default remindersSlice.reducer;