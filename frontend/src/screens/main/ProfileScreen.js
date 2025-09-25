import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import { logout } from '../../store/slices/authSlice';

const ProfileScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [notifications, setNotifications] = useState({
    reminders: true,
    taskDue: true,
    dailySummary: false,
  });

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear any scheduled notifications
              const notificationService = await import('../../services/notificationService');
              await notificationService.default.cancelAllNotifications();

              // Clear local storage
              const AsyncStorage = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.default.multiRemove([
                'userToken',
                'refreshToken',
                'plannerEvents',
                'reminders',
                'pushToken'
              ]);

              // Dispatch logout action
              dispatch(logout());
            } catch (error) {
              console.error('Logout error:', error);
              dispatch(logout()); // Logout anyway
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Info', 'Account deletion will be implemented soon');
          },
        },
      ]
    );
  };

  const settingItem = (icon, title, subtitle, rightComponent) => (
    <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
          <Icon name={icon} size={22} color={theme.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'JD'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>
          {user?.name || 'John Doe'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user?.email || 'john.doe@plannerapp.com'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>247</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>89%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Complete</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>15</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reminders</Text>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ACCOUNT
        </Text>

        <TouchableOpacity>
          {settingItem('person', 'Edit Profile', 'Update your name and photo',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('lock', 'Change Password', 'Update your password',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('email', 'Email Preferences', 'Manage email notifications',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          APP SETTINGS
        </Text>

        {settingItem('brightness-6', 'Dark Mode', 'Toggle dark theme',
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDarkMode ? theme.surface : '#f4f3f4'}
          />
        )}

        {settingItem('notifications', 'Reminder Notifications', 'Get notified for reminders',
          <Switch
            value={notifications.reminders}
            onValueChange={(value) =>
              setNotifications({ ...notifications, reminders: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={notifications.reminders ? theme.surface : '#f4f3f4'}
          />
        )}

        {settingItem('assignment-late', 'Task Due Notifications', 'Get notified for due tasks',
          <Switch
            value={notifications.taskDue}
            onValueChange={(value) =>
              setNotifications({ ...notifications, taskDue: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={notifications.taskDue ? theme.surface : '#f4f3f4'}
          />
        )}

        {settingItem('today', 'Daily Summary', 'Receive daily task summary',
          <Switch
            value={notifications.dailySummary}
            onValueChange={(value) =>
              setNotifications({ ...notifications, dailySummary: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={notifications.dailySummary ? theme.surface : '#f4f3f4'}
          />
        )}
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          DATA & PRIVACY
        </Text>

        <TouchableOpacity>
          {settingItem('backup', 'Backup Data', 'Export your tasks and reminders',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('restore', 'Restore Data', 'Import your backed up data',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('delete-sweep', 'Clear All Data', 'Remove all tasks and reminders',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SUPPORT
        </Text>

        <TouchableOpacity>
          {settingItem('help', 'Help & FAQ', 'Get help and find answers',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('feedback', 'Send Feedback', 'Share your thoughts with us',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          {settingItem('info', 'About', 'App version and information',
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color={theme.error} />
          <Text style={[styles.actionButtonText, { color: theme.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { borderColor: theme.error }]}
          onPress={handleDeleteAccount}
        >
          <Icon name="delete-forever" size={20} color={theme.error} />
          <Text style={[styles.actionButtonText, { color: theme.error }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          Planner Pro - Version 2.1.0
        </Text>
        <Text style={[styles.copyright, { color: theme.textSecondary }]}>
          © 2024 Planner App - Organize Your Life
        </Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          "Productivity is never an accident"
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 12,
  },
  version: {
    fontSize: 12,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;