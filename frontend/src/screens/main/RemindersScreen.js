import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const RemindersScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [reminders, setReminders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    enabled: true,
    repeat: 'none',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // Load reminders when component mounts
    loadReminders();
  }, [user?.id]);

  const loadReminders = () => {
    // TODO: Fetch reminders from backend
    // For now, using comprehensive planner-related mock data
    setReminders([
      {
        id: '1',
        title: 'Daily Standup',
        description: 'Team sync meeting - Discuss yesterday\'s progress and today\'s goals',
        date: new Date(),
        time: new Date().setHours(9, 15),
        enabled: true,
        repeat: 'daily',
      },
      {
        id: '2',
        title: 'Project Deadline Review',
        description: 'Review upcoming project milestones and deliverables',
        date: new Date(),
        time: new Date().setHours(14, 0),
        enabled: true,
        repeat: 'weekly',
      },
      {
        id: '3',
        title: 'Take Medication',
        description: 'Daily vitamins and supplements',
        date: new Date(),
        time: new Date().setHours(8, 0),
        enabled: true,
        repeat: 'daily',
      },
      {
        id: '4',
        title: 'Water Break',
        description: 'Stay hydrated - drink a glass of water',
        date: new Date(),
        time: new Date().setHours(11, 0),
        enabled: true,
        repeat: 'daily',
      },
      {
        id: '5',
        title: 'Lunch Break',
        description: 'Take a proper lunch break away from desk',
        date: new Date(),
        time: new Date().setHours(12, 30),
        enabled: true,
        repeat: 'daily',
      },
      {
        id: '6',
        title: 'Weekly Report',
        description: 'Submit weekly progress report to manager',
        date: new Date(),
        time: new Date().setHours(16, 0),
        enabled: true,
        repeat: 'weekly',
      },
      {
        id: '7',
        title: 'Gym Session',
        description: 'Workout at the gym - Leg day',
        date: new Date(),
        time: new Date().setHours(18, 0),
        enabled: true,
        repeat: 'none',
      },
      {
        id: '8',
        title: 'Monthly Budget Review',
        description: 'Review monthly expenses and update budget spreadsheet',
        date: new Date(),
        time: new Date().setHours(19, 0),
        enabled: false,
        repeat: 'monthly',
      },
    ]);
  };

  const handleCreateReminder = () => {
    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
    };
    setReminders([...reminders, reminder]);
    setShowCreateModal(false);
    resetNewReminder();
    Alert.alert('Success', 'Reminder created successfully');
  };

  const handleToggleReminder = (id) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ));
  };

  const handleDeleteReminder = (id) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReminders(reminders.filter(r => r.id !== id));
          },
        },
      ]
    );
  };

  const resetNewReminder = () => {
    setNewReminder({
      title: '',
      description: '',
      date: new Date(),
      time: new Date(),
      enabled: true,
      repeat: 'none',
    });
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderReminder = ({ item }) => (
    <View style={[styles.reminderCard, { backgroundColor: theme.surface }]}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.reminderDescription, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.reminderMeta}>
            <Icon name="access-time" size={16} color={theme.textSecondary} />
            <Text style={[styles.reminderTime, { color: theme.textSecondary }]}>
              {formatTime(new Date(item.time))}
            </Text>
            {item.repeat !== 'none' && (
              <>
                <Icon name="repeat" size={16} color={theme.textSecondary} style={{ marginLeft: 10 }} />
                <Text style={[styles.reminderRepeat, { color: theme.textSecondary }]}>
                  {item.repeat}
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.reminderActions}>
          <Switch
            value={item.enabled}
            onValueChange={() => handleToggleReminder(item.id)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={item.enabled ? theme.surface : '#f4f3f4'}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReminder(item.id)}
          >
            <Icon name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Reminders
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No reminders yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to create your first reminder
            </Text>
          </View>
        }
      />

      {/* Create Reminder Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                New Reminder
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                resetNewReminder();
              }}>
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Reminder title"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textSecondary}
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateTimeButton, {
                  backgroundColor: theme.background,
                  borderColor: theme.border
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="event" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {newReminder.date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, {
                  backgroundColor: theme.background,
                  borderColor: theme.border
                }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="access-time" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>
                  {formatTime(newReminder.time)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.repeatRow}>
              <Text style={[styles.repeatLabel, { color: theme.text }]}>
                Repeat:
              </Text>
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
              onPress={handleCreateReminder}
              disabled={!newReminder.title.trim()}
            >
              <Text style={styles.createButtonText}>Create Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && Platform.OS === 'web' ? (
        <input
          type="date"
          value={newReminder.date.toISOString().split('T')[0]}
          onChange={(e) => {
            setNewReminder({ ...newReminder, date: new Date(e.target.value) });
            setShowDatePicker(false);
          }}
          style={{ position: 'absolute', top: -1000 }}
          ref={(ref) => ref && ref.showPicker()}
        />
      ) : showDatePicker && (
        <DateTimePicker
          value={newReminder.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setNewReminder({ ...newReminder, date: selectedDate });
            }
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && Platform.OS === 'web' ? (
        <input
          type="time"
          value={`${newReminder.time.getHours().toString().padStart(2, '0')}:${newReminder.time.getMinutes().toString().padStart(2, '0')}`}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newTime = new Date();
            newTime.setHours(parseInt(hours), parseInt(minutes));
            setNewReminder({ ...newReminder, time: newTime });
            setShowTimePicker(false);
          }}
          style={{ position: 'absolute', top: -1000 }}
          ref={(ref) => ref && ref.showPicker()}
        />
      ) : showTimePicker && (
        <DateTimePicker
          value={newReminder.time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setNewReminder({ ...newReminder, time: selectedTime });
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listContainer: {
    padding: 16,
  },
  reminderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  reminderRepeat: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  repeatRow: {
    marginBottom: 20,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  repeatOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  repeatOptionText: {
    fontSize: 14,
  },
  createButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RemindersScreen;