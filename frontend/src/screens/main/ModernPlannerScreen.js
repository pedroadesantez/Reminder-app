import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../themes/ThemeContext';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import notificationService from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ModernPlannerScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState({});
  const [reminders, setReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: new Date(),
    repeat: 'none',
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Initialize notifications
    notificationService.initialize();

    // Setup notification listeners
    notificationService.setupListeners(
      (notification) => {
        // Handle foreground notification
        console.log('Received notification:', notification);
      },
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data.type === 'reminder') {
          navigation.navigate('Reminders');
        } else if (data.type === 'task') {
          navigation.navigate('Tasks');
        }
      }
    );

    // Load saved data
    loadEvents();
    loadReminders();

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for upcoming reminders every minute
    const reminderCheck = setInterval(() => {
      notificationService.checkUpcomingReminders(reminders);
    }, 60000);

    return () => {
      clearInterval(reminderCheck);
      notificationService.removeListeners();
    };
  }, []);

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('plannerEvents');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        // Default events
        setEvents({
          '2025-09-25': [
            { id: '1', title: 'Sprint Planning', time: '11:00 AM', type: 'meeting', color: '#4CAF50' },
            { id: '2', title: 'Gym Session', time: '06:00 PM', type: 'personal', color: '#00BCD4' },
          ],
          '2025-09-26': [
            { id: '3', title: 'Client Presentation', time: '02:00 PM', type: 'work', color: '#FF5252' },
            { id: '4', title: 'Team Lunch', time: '12:30 PM', type: 'personal', color: '#2196F3' },
          ],
        });
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadReminders = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem('reminders');
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      await AsyncStorage.setItem('plannerEvents', JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const handleSetReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
      date: selectedDate,
      enabled: true,
    };

    try {
      // Schedule notification
      const notificationId = await notificationService.scheduleReminder(reminder);
      reminder.notificationId = notificationId;

      // Save reminder
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));

      // Play sound and show confirmation
      notificationService.playNotificationSound('reminder');
      Alert.alert('Success', 'Reminder has been set!');

      setShowReminderModal(false);
      setNewReminder({ title: '', description: '', time: new Date(), repeat: 'none' });
    } catch (error) {
      Alert.alert('Error', 'Failed to set reminder');
    }
  };

  const handleCreateTask = () => {
    setShowTaskModal(false);
    navigation.navigate('Tasks');
  };

  const renderEventCard = (event) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, { borderLeftColor: event.color }]}
      onPress={() => {
        Alert.alert(
          event.title,
          `Time: ${event.time}\nType: ${event.type}`,
          [
            { text: 'Edit', onPress: () => console.log('Edit event') },
            { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(event.id) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }}
    >
      <BlurView intensity={isDarkMode ? 30 : 50} style={styles.blurCard}>
        <View style={styles.eventContent}>
          <Text style={[styles.eventTime, { color: theme.textSecondary }]}>{event.time}</Text>
          <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
          <Text style={[styles.eventType, { color: theme.textSecondary }]}>{event.type}</Text>
        </View>
        <Icon name="chevron-right" size={24} color={theme.textSecondary} />
      </BlurView>
    </TouchableOpacity>
  );

  const deleteEvent = (eventId) => {
    const updatedEvents = { ...events };
    updatedEvents[selectedDate] = updatedEvents[selectedDate].filter(e => e.id !== eventId);
    saveEvents(updatedEvents);
  };

  const GlassButton = ({ onPress, title, icon, gradient }) => (
    <TouchableOpacity onPress={onPress} style={styles.glassButton}>
      <LinearGradient
        colors={gradient}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={icon} size={24} color="#fff" />
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <AnimatedBackground variant="planner">
      <Animated.ScrollView
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header Stats with Glassmorphism */}
        <View style={styles.statsContainer}>
          <BlurView intensity={isDarkMode ? 40 : 60} style={styles.statCard}>
            <LinearGradient
              colors={['rgba(79, 172, 254, 0.2)', 'rgba(0, 242, 254, 0.2)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Icon name="event" size={24} color="#fff" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events Today</Text>
          </BlurView>

          <BlurView intensity={isDarkMode ? 40 : 60} style={styles.statCard}>
            <LinearGradient
              colors={['rgba(254, 172, 94, 0.2)', 'rgba(255, 154, 158, 0.2)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Icon name="schedule" size={24} color="#fff" />
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </BlurView>

          <BlurView intensity={isDarkMode ? 40 : 60} style={styles.statCard}>
            <LinearGradient
              colors={['rgba(67, 233, 123, 0.2)', 'rgba(56, 249, 215, 0.2)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </BlurView>
        </View>

        {/* Calendar with Glass Effect */}
        <BlurView intensity={isDarkMode ? 20 : 40} style={styles.calendarContainer}>
          <Calendar
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: theme.primary },
              ...Object.keys(events).reduce((acc, date) => {
                acc[date] = { marked: true, dotColor: theme.accent };
                return acc;
              }, {}),
            }}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
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
        </BlurView>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Schedule - {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setShowEventModal(true)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {events[selectedDate]?.length > 0 ? (
            events[selectedDate].map(renderEventCard)
          ) : (
            <BlurView intensity={isDarkMode ? 30 : 50} style={styles.emptyState}>
              <Icon name="event-available" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No events scheduled
              </Text>
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowEventModal(true)}
              >
                <Text style={styles.ctaButtonText}>Add Event</Text>
              </TouchableOpacity>
            </BlurView>
          )}
        </View>

        {/* Quick Actions with Gradient Buttons */}
        <View style={styles.quickActions}>
          <GlassButton
            onPress={() => setShowReminderModal(true)}
            title="Set Reminder"
            icon="add-alarm"
            gradient={['#667eea', '#764ba2']}
          />
          <GlassButton
            onPress={() => setShowTaskModal(true)}
            title="Create Task"
            icon="event-note"
            gradient={['#f093fb', '#f5576c']}
          />
          <GlassButton
            onPress={() => navigation.navigate('Reminders')}
            title="View All"
            icon="view-list"
            gradient={['#4facfe', '#00f2fe']}
          />
        </View>

        {/* Set Reminder Modal */}
        <Modal
          visible={showReminderModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowReminderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} style={styles.modalContent}>
              <LinearGradient
                colors={isDarkMode
                  ? ['rgba(30, 30, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']
                  : ['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 255, 0.95)']
                }
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Set Reminder
                </Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                  <Icon name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.glassInput, { color: theme.text, borderColor: theme.border }]}
                placeholder="Reminder title"
                placeholderTextColor={theme.textSecondary}
                value={newReminder.title}
                onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              />

              <TextInput
                style={[styles.glassInput, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                placeholder="Description (optional)"
                placeholderTextColor={theme.textSecondary}
                value={newReminder.description}
                onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.repeatOptions}>
                {['none', 'daily', 'weekly', 'monthly'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.repeatOption,
                      { borderColor: theme.border },
                      newReminder.repeat === option && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, repeat: option })}
                  >
                    <Text
                      style={[
                        styles.repeatOptionText,
                        { color: newReminder.repeat === option ? '#fff' : theme.text },
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSetReminder}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                >
                  <Icon name="alarm-on" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Set Reminder</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>

        {/* Create Task Modal */}
        <Modal
          visible={showTaskModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTaskModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} style={styles.modalContent}>
              <LinearGradient
                colors={isDarkMode
                  ? ['rgba(30, 30, 46, 0.95)', 'rgba(22, 33, 62, 0.95)']
                  : ['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 255, 0.95)']
                }
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Quick Task
                </Text>
                <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                  <Icon name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                You'll be redirected to the Tasks screen to create a detailed task.
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateTask}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.buttonGradient}
                >
                  <Icon name="add-task" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Go to Tasks</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>
      </Animated.ScrollView>
    </AnimatedBackground>
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
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  calendarContainer: {
    margin: 15,
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  blurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
  },
  eventContent: {
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
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
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
  },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 20,
  },
  glassButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
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
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModernPlannerScreen;