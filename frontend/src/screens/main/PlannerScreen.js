import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import Toast from 'react-native-toast-message';

const PlannerScreen = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState({
    '2025-09-23': [
      { id: '1', title: 'Team Meeting', time: '09:00 AM', type: 'meeting', color: '#4CAF50' },
      { id: '2', title: 'Project Deadline', time: '02:00 PM', type: 'deadline', color: '#FF5252' },
      { id: '3', title: 'Lunch with Client', time: '12:30 PM', type: 'personal', color: '#2196F3' },
    ],
    '2025-09-24': [
      { id: '4', title: 'Code Review', time: '10:00 AM', type: 'work', color: '#9C27B0' },
      { id: '5', title: 'Dentist Appointment', time: '04:00 PM', type: 'personal', color: '#FF9800' },
    ],
    '2025-09-25': [
      { id: '6', title: 'Sprint Planning', time: '11:00 AM', type: 'meeting', color: '#4CAF50' },
      { id: '7', title: 'Gym Session', time: '06:00 PM', type: 'personal', color: '#00BCD4' },
    ],
  });
  const [showAddEvent, setShowAddEvent] = useState(false);

  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: theme.primary },
    ...Object.keys(events).reduce((acc, date) => {
      if (date !== selectedDate) {
        acc[date] = { marked: true, dotColor: theme.accent };
      }
      return acc;
    }, {}),
  };

  const todayEvents = events[selectedDate] || [];

  const upcomingEvents = [
    { title: 'Weekly Standup', date: 'Tomorrow', time: '09:30 AM', priority: 'high' },
    { title: 'Product Launch', date: 'Sep 30', time: 'All Day', priority: 'critical' },
    { title: 'Performance Review', date: 'Oct 5', time: '03:00 PM', priority: 'medium' },
    { title: 'Conference Call', date: 'Oct 8', time: '11:00 AM', priority: 'low' },
  ];

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: theme.surface, borderLeftColor: item.color }]}
      onPress={() => Toast.show({
        type: 'info',
        text1: item.title,
        text2: `Scheduled at ${item.time}`,
        position: 'top',
        topOffset: 60,
      })}
    >
      <View style={styles.eventTime}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{item.time}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.eventType, { color: theme.textSecondary }]}>{item.type}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const renderUpcomingEvent = ({ item }) => {
    const priorityColors = {
      critical: '#FF5252',
      high: '#FF9800',
      medium: '#FFC107',
      low: '#4CAF50',
    };

    return (
      <TouchableOpacity style={[styles.upcomingCard, { backgroundColor: theme.surface }]}>
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.primary }]}>
          <Icon name="event" size={24} color="#FFF" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Events Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.accent }]}>
          <Icon name="schedule" size={24} color="#FFF" />
          <Text style={styles.statNumber}>48</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.success }]}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]}>
        <Calendar
          markedDates={markedDates}
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
            Today's Schedule - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddEvent(true)}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
          >
            <Icon name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {todayEvents.length > 0 ? (
          <FlatList
            data={todayEvents}
            renderItem={renderEvent}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Icon name="event-available" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No events scheduled for this day
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowAddEvent(true)}
            >
              <Text style={styles.ctaButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Events</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcomingEvents}
          renderItem={renderUpcomingEvent}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.primary }]}>
          <Icon name="add-alarm" size={24} color="#FFF" />
          <Text style={styles.quickActionText}>Set Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.accent }]}>
          <Icon name="event-note" size={24} color="#FFF" />
          <Text style={styles.quickActionText}>Create Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.success }]}>
          <Icon name="people" size={24} color="#FFF" />
          <Text style={styles.quickActionText}>Team View</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  calendarContainer: {
    margin: 15,
    borderRadius: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
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
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
  },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  upcomingCard: {
    width: 200,
    padding: 15,
    marginRight: 12,
    borderRadius: 12,
  },
  priorityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
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
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
});

export default PlannerScreen;