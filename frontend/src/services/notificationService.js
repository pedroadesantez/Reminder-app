import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.soundEnabled = true;
    this.notificationSounds = {
      reminder: 'notification_sound.wav',
      task: 'task_complete.wav',
      alert: 'alert_sound.wav',
    };
  }

  // Initialize notification service
  async initialize() {
    try {
      // Check if device supports notifications
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return false;
        }

        // Get push token
        const token = await Notifications.getExpoPushTokenAsync();
        await this.savePushToken(token.data);

        // Configure Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });

          await Notifications.setNotificationChannelAsync('tasks', {
            name: 'Tasks',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250],
            sound: 'default',
          });
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Load sound preferences
      const soundPref = await AsyncStorage.getItem('soundEnabled');
      this.soundEnabled = soundPref !== 'false';

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Save push token to backend
  async savePushToken(token) {
    try {
      await AsyncStorage.setItem('pushToken', token);
      // TODO: Send token to backend
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Schedule a reminder notification
  async scheduleReminder(reminder) {
    try {
      const { title, description, date, time, repeat } = reminder;

      // Combine date and time
      const triggerDate = new Date(date);
      const timeDate = new Date(time);
      triggerDate.setHours(timeDate.getHours());
      triggerDate.setMinutes(timeDate.getMinutes());

      // Calculate trigger time
      const trigger = {
        date: triggerDate,
        repeats: repeat !== 'none',
      };

      // Set repeat interval
      if (repeat === 'daily') {
        trigger.repeats = true;
        trigger.seconds = 86400; // 24 hours
      } else if (repeat === 'weekly') {
        trigger.repeats = true;
        trigger.seconds = 604800; // 7 days
      } else if (repeat === 'monthly') {
        trigger.repeats = true;
        // Monthly is more complex, using days instead
        trigger.seconds = 2592000; // 30 days approximation
      }

      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${title}`,
          body: description,
          data: { type: 'reminder', reminderId: reminder.id },
          sound: this.soundEnabled,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'reminder',
        },
        trigger,
      });

      // Play sound immediately for testing
      if (this.soundEnabled && Platform.OS === 'web') {
        this.playNotificationSound('reminder');
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  // Schedule a task due notification
  async scheduleTaskDue(task) {
    try {
      const { title, dueDate, priority } = task;
      const trigger = new Date(dueDate);

      // Schedule 1 hour before due
      trigger.setHours(trigger.getHours() - 1);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📋 Task Due Soon`,
          body: `"${title}" is due in 1 hour`,
          data: { type: 'task', taskId: task.id },
          sound: this.soundEnabled,
          priority: priority === 'critical'
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling task notification:', error);
      throw error;
    }
  }

  // Show instant notification
  async showInstantNotification(title, body, data = {}) {
    try {
      await Notifications.presentNotificationAsync({
        title,
        body,
        data,
        sound: this.soundEnabled,
      });

      // Play sound for web
      if (this.soundEnabled && Platform.OS === 'web') {
        this.playNotificationSound(data.type || 'alert');
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Play notification sound (for web)
  playNotificationSound(type = 'reminder') {
    if (!this.soundEnabled || Platform.OS !== 'web') return;

    try {
      const audio = new Audio(`/sounds/${this.notificationSounds[type] || 'notification.mp3'}`);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Toggle sound on/off
  async toggleSound(enabled) {
    this.soundEnabled = enabled;
    await AsyncStorage.setItem('soundEnabled', enabled.toString());
  }

  // Set up notification listeners
  setupListeners(onNotificationReceived, onNotificationResponse) {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for when user interacts with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
  }

  // Clean up listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Check if notification time is approaching (within 5 minutes)
  checkUpcomingReminders(reminders) {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    reminders.forEach(reminder => {
      if (!reminder.enabled) return;

      const reminderTime = new Date(reminder.time);

      // Check if reminder is within the next 5 minutes
      if (reminderTime >= now && reminderTime <= fiveMinutesFromNow) {
        this.showInstantNotification(
          '⏰ Reminder Coming Up',
          `"${reminder.title}" in ${Math.round((reminderTime - now) / 60000)} minutes`,
          { type: 'reminder', reminderId: reminder.id }
        );
      }
    });
  }

  // Daily summary notification
  async scheduleDailySummary(tasks, reminders) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const pendingTasks = tasks.filter(t => !t.completed).length;
    const todayReminders = reminders.filter(r => {
      const reminderDate = new Date(r.date);
      return reminderDate.toDateString() === new Date().toDateString();
    }).length;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Daily Summary',
        body: `You have ${pendingTasks} pending tasks and ${todayReminders} reminders today`,
        data: { type: 'summary' },
        sound: this.soundEnabled,
      },
      trigger: tomorrow,
    });
  }
}

// Export singleton instance
export default new NotificationService();