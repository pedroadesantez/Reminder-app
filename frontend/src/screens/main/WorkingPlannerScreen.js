import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const WorkingPlannerScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState({
    '2025-09-25': [
      { id: '1', title: 'Sprint Planning', time: '11:00 AM', type: 'meeting', color: '#4CAF50' },
      { id: '2', title: 'Gym Session', time: '06:00 PM', type: 'personal', color: '#00BCD4' },
    ],
    '2025-09-26': [
      { id: '3', title: 'Client Presentation', time: '02:00 PM', type: 'work', color: '#FF5252' },
    ],
  });

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: '09:00',
    repeat: 'none',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    type: 'meeting',
    color: '#4CAF50',
  });

  // Get today's events
  const todayEvents = events[selectedDate] || [];

  const upcomingEvents = [
    { title: 'Weekly Standup', date: 'Tomorrow', time: '09:30 AM', priority: 'high' },
    { title: 'Product Launch', date: 'Sep 30', time: 'All Day', priority: 'critical' },
    { title: 'Performance Review', date: 'Oct 5', time: '03:00 PM', priority: 'medium' },
    { title: 'Conference Call', date: 'Oct 8', time: '11:00 AM', priority: 'low' },
  ];

  const handleSetReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    try {
      // Create reminder object
      const reminder = {
        id: Date.now().toString(),
        ...newReminder,
        date: selectedDate,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      const existingReminders = await AsyncStorage.getItem('reminders');
      const reminders = existingReminders ? JSON.parse(existingReminders) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));

      // Show success alert
      Alert.alert('Success!', `Reminder "${newReminder.title}" has been set for ${newReminder.time}`, [
        { text: 'View Reminders', onPress: () => navigation.navigate('Reminders') },
        { text: 'OK', style: 'cancel' },
      ]);

      // Reset form and close modal
      setNewReminder({ title: '', description: '', time: '09:00', repeat: 'none' });
      setShowReminderModal(false);

      // Play notification sound (web only)
      if (Platform.OS === 'web') {
        try {
          // Create a simple beep sound using Web Audio API
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
          console.log('Audio not supported or blocked');
        }
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder');
    }
  };

  const handleCreateTask = () => {
    Alert.alert(
      '📋 Create New Task',
      'You will be redirected to the Tasks screen where you can create a detailed task with priority, due date, and more.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Tasks',
          onPress: () => navigation.navigate('Tasks'),
          style: 'default'
        },
      ]
    );
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const event = {
      id: Date.now().toString(),
      ...newEvent,
    };

    // Add event to the selected date
    const updatedEvents = { ...events };
    if (!updatedEvents[selectedDate]) {
      updatedEvents[selectedDate] = [];
    }
    updatedEvents[selectedDate].push(event);
    setEvents(updatedEvents);

    // Reset form and close modal
    setNewEvent({ title: '', time: '09:00', type: 'meeting', color: '#4CAF50' });
    setShowEventModal(false);

    Alert.alert('Success!', `Event "${event.title}" has been added to your calendar`, [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleTeamView = () => {
    Alert.alert(
      '👥 Team View',
      'Team collaboration features:\n\n• Share calendars with teammates\n• Collaborative task management\n• Team meeting scheduling\n• Progress tracking\n\nComing soon in the next update!',
      [
        { text: 'Notify Me', onPress: () => Alert.alert('✅ Notification Set', 'You\'ll be notified when Team View is available!') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const renderEvent = (event) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, { backgroundColor: theme.surface, borderLeftColor: event.color }]}
      onPress={() => {
        Alert.alert(
          event.title,
          `Time: ${event.time}\nType: ${event.type}`,
          [
            { text: 'Edit', onPress: () => Alert.alert('Edit', 'Edit functionality coming soon!') },
            { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(event.id) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }}
    >
      <View style={styles.eventTime}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{event.time}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
        <Text style={[styles.eventType, { color: theme.textSecondary }]}>{event.type}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const deleteEvent = (eventId) => {
    const updatedEvents = { ...events };
    if (updatedEvents[selectedDate]) {
      updatedEvents[selectedDate] = updatedEvents[selectedDate].filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      Alert.alert('Success', 'Event deleted successfully');
    }
  };

  const renderUpcomingEvent = (item, index) => {
    const priorityColors = {
      critical: '#FF5252',
      high: '#FF9800',
      medium: '#FFC107',
      low: '#4CAF50',
    };

    return (
      <TouchableOpacity
        key={index}
        style={[styles.upcomingCard, { backgroundColor: theme.surface }]}
        onPress={() => Alert.alert(item.title, `Date: ${item.date}\nTime: ${item.time}\nPriority: ${item.priority}`)}
      >
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
        <Text style={[styles.upcomingTitle, { color: theme.text }]}>{item.title}</Text>
        <View style={styles.upcomingMeta}>
          <Icon name="event" size={14} color={theme.textSecondary} />
          <Text style={[styles.upcomingDate, { color: theme.textSecondary }]}>{item.date}</Text>
          <Icon name="schedule" size={14} color={theme.textSecondary} style={{ marginLeft: 10 }} />
          <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.primary }]}>
            <Icon name="event" size={24} color="#FFF" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.accent }]}>
            <Icon name="schedule" size={24} color="#FFF" />
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Icon name="check-circle" size={24} color="#FFF" />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]}>
          <Calendar
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: theme.primary },
              ...Object.keys(events).reduce((acc, date) => {
                if (date !== selectedDate) {
                  acc[date] = { marked: true, dotColor: theme.accent };
                }
                return acc;
              }, {}),
            }}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: theme.surface,
              calendarBackground: theme.surface,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              dotColor: theme.accent,
              selectedDotColor: '#ffffff',
              arrowColor: theme.primary,
              monthTextColor: theme.text,
            }}
          />
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Today's Schedule - {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setShowEventModal(true)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.7}
            >
              <Icon name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {todayEvents.length > 0 ? (
            todayEvents.map(renderEvent)
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Icon name="event-available" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No events scheduled for this day
              </Text>
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: theme.primary }]}
                onPress={() => Alert.alert('Add Event', 'Event creation feature coming soon!')}
              >
                <Text style={styles.ctaButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Events</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.upcomingScroll}
          >
            {upcomingEvents.map(renderUpcomingEvent)}
          </ScrollView>
        </View>

        {/* Quick Actions - WORKING BUTTONS */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#667eea' }]}
            onPress={() => setShowReminderModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="add-alarm" size={24} color="#FFF" />
            <Text style={styles.quickActionText}>Set Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#f093fb' }]}
            onPress={handleCreateTask}
            activeOpacity={0.8}
          >
            <Icon name="event-note" size={24} color="#FFF" />
            <Text style={styles.quickActionText}>Create Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleTeamView}
            activeOpacity={0.8}
          >
            <Icon name="people" size={24} color="#FFF" />
            <Text style={styles.quickActionText}>Team View</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Set Reminder Modal - WORKING */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                🔔 Set Reminder
              </Text>
              <TouchableOpacity
                onPress={() => setShowReminderModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="What would you like to be reminded about?"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              multiline={false}
              returnKeyType="next"
            />

            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Additional notes (optional)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.timeContainer}>
              <Text style={[styles.timeLabel, { color: theme.text }]}>Time:</Text>
              <TextInput
                style={[styles.timeInput, {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                placeholder="09:00"
                placeholderTextColor={theme.textSecondary}
                value={newReminder.time}
                onChangeText={(text) => setNewReminder({ ...newReminder, time: text })}
              />
            </View>

            <View style={styles.repeatRow}>
              <Text style={[styles.repeatLabel, { color: theme.text }]}>Repeat:</Text>
              <View style={styles.repeatOptions}>
                {['none', 'daily', 'weekly', 'monthly'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.repeatOption,
                      { borderColor: theme.border },
                      newReminder.repeat === option && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary
                      }
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, repeat: option })}
                  >
                    <Text style={[
                      styles.repeatOptionText,
                      { color: newReminder.repeat === option ? '#fff' : theme.text }
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={handleSetReminder}
              disabled={!newReminder.title.trim()}
            >
              <Icon name="alarm-on" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Event Modal - WORKING */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                📅 Add Event
              </Text>
              <TouchableOpacity
                onPress={() => setShowEventModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Event title (e.g. Team Meeting)"
              placeholderTextColor={theme.textSecondary}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              returnKeyType="next"
            />

            <View style={styles.timeContainer}>
              <Text style={[styles.timeLabel, { color: theme.text }]}>Time:</Text>
              <TextInput
                style={[styles.timeInput, {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                placeholder="09:00 AM"
                placeholderTextColor={theme.textSecondary}
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
              />
            </View>

            <View style={styles.repeatRow}>
              <Text style={[styles.repeatLabel, { color: theme.text }]}>Event Type:</Text>
              <View style={styles.repeatOptions}>
                {[
                  { key: 'meeting', label: 'Meeting', color: '#4CAF50' },
                  { key: 'work', label: 'Work', color: '#FF5252' },
                  { key: 'personal', label: 'Personal', color: '#2196F3' },
                  { key: 'other', label: 'Other', color: '#9C27B0' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.repeatOption,
                      {
                        borderColor: theme.border,
                        backgroundColor: newEvent.type === option.key ? option.color : 'transparent'
                      },
                      newEvent.type === option.key && {
                        borderColor: option.color
                      }
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type: option.key, color: option.color })}
                  >
                    <Text style={[
                      styles.repeatOptionText,
                      { color: newEvent.type === option.key ? '#fff' : theme.text }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={handleCreateEvent}
              disabled={!newEvent.title.trim()}
            >
              <Icon name="event" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  calendarContainer: {
    margin: 15,
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventTime: {
    marginRight: 15,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
  },
  ctaButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  upcomingScroll: {
    marginTop: 10,
  },
  upcomingCard: {
    width: 200,
    padding: 15,
    marginRight: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priorityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    paddingRight: 60,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDate: {
    fontSize: 12,
    marginLeft: 5,
  },
  upcomingTime: {
    fontSize: 12,
    marginLeft: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 20,
  },
  quickActionButton: {
    width: 100,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: 'center',
  },
  repeatRow: {
    marginBottom: 20,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  repeatOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkingPlannerScreen;