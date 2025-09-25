import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';

const CreateTaskModal = ({ visible, onClose, onSave, task = null }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    tags: [],
    category: '',
    estimatedTime: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tags: task.tags || [],
        category: task.category || '',
        estimatedTime: task.estimatedTime || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: null,
        tags: [],
        category: '',
        estimatedTime: '',
      });
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    const taskData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate?.toISOString(),
      tags: formData.tags.filter(tag => tag.trim()),
    };

    onSave(taskData);
    setTagInput('');
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const priorityOptions = [
    { key: 'low', label: 'Low', color: theme.success, icon: 'keyboard-arrow-down' },
    { key: 'medium', label: 'Medium', color: theme.warning, icon: 'keyboard-arrow-up' },
    { key: 'high', label: 'High', color: theme.error, icon: 'keyboard-double-arrow-up' },
  ];

  const categories = [
    'Work', 'Personal', 'Health', 'Shopping', 'Finance', 'Education', 'Family'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {task ? 'Edit Task' : 'Create Task'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: theme.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Enter task title..."
              placeholderTextColor={theme.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Add description..."
              placeholderTextColor={theme.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: formData.priority === option.key 
                        ? option.color + '20' 
                        : theme.surface,
                      borderColor: formData.priority === option.key 
                        ? option.color 
                        : theme.border,
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, priority: option.key }))}
                >
                  <Icon 
                    name={option.icon} 
                    size={16} 
                    color={formData.priority === option.key ? option.color : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.priorityText,
                    { color: formData.priority === option.key ? option.color : theme.text }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Due Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.surface }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="schedule" size={20} color={theme.textSecondary} />
              <Text style={[styles.dateButtonText, { color: theme.text }]}>
                {formData.dueDate 
                  ? formData.dueDate.toLocaleDateString()
                  : 'Set due date'
                }
              </Text>
              {formData.dueDate && (
                <TouchableOpacity 
                  onPress={() => setFormData(prev => ({ ...prev, dueDate: null }))}
                  style={styles.clearDateButton}
                >
                  <Icon name="clear" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: formData.category === category 
                          ? theme.primary + '20' 
                          : theme.surface,
                        borderColor: formData.category === category 
                          ? theme.primary 
                          : theme.border,
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ 
                      ...prev, 
                      category: prev.category === category ? '' : category 
                    }))}
                  >
                    <Text style={[
                      styles.categoryText,
                      { color: formData.category === category ? theme.primary : theme.text }
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.tagInput, { backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Add tag..."
                placeholderTextColor={theme.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity 
                onPress={handleAddTag}
                style={[styles.addTagButton, { backgroundColor: theme.primary }]}
              >
                <Icon name="add" size={16} color={theme.textInverse} />
              </TouchableOpacity>
            </View>
            
            {formData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {formData.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
                    <TouchableOpacity 
                      onPress={() => handleRemoveTag(tag)}
                      style={styles.removeTagButton}
                    >
                      <Icon name="close" size={14} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Estimated Time */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Estimated Time</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="e.g., 30 minutes, 2 hours"
              placeholderTextColor={theme.textSecondary}
              value={formData.estimatedTime}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedTime: text }))}
            />
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData(prev => ({ ...prev, dueDate: selectedDate }));
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  clearDateButton: {
    padding: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 6,
  },
});

export default CreateTaskModal;