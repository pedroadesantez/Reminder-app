import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import moment from 'moment';
import { useTheme } from '../../themes/ThemeContext';

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const translateX = new Animated.Value(0);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.error;
      case 'medium':
        return theme.warning;
      case 'low':
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'keyboard-double-arrow-up';
      case 'medium':
        return 'keyboard-arrow-up';
      case 'low':
        return 'keyboard-arrow-down';
      default:
        return 'remove';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const now = moment();
    const due = moment(dueDate);
    const diffDays = due.diff(now, 'days');
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: theme.error };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: theme.warning };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: theme.primary };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: theme.textSecondary };
    }
    
    return { text: due.format('MMM DD, YYYY'), color: theme.textSecondary };
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.translationX > 100) {
      // Swipe right - Edit
      onEdit(task);
    } else if (event.nativeEvent.translationX < -100) {
      // Swipe left - Delete
      onDelete(task.id);
    }
    
    // Reset position
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[
        styles.container,
        { 
          backgroundColor: task.completed ? theme.surface : theme.card,
          transform: [{ translateX }]
        }
      ]}>
        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            { borderColor: task.completed ? theme.success : theme.border }
          ]}
          onPress={() => onToggleComplete(task.id, task.completed)}
        >
          {task.completed && (
            <Icon name="check" size={16} color={theme.success} />
          )}
        </TouchableOpacity>

        {/* Task Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              { 
                color: task.completed ? theme.textSecondary : theme.text,
                textDecorationLine: task.completed ? 'line-through' : 'none'
              }
            ]}>
              {task.title}
            </Text>
            
            {/* Priority Indicator */}
            {task.priority && (
              <Icon
                name={getPriorityIcon(task.priority)}
                size={16}
                color={getPriorityColor(task.priority)}
                style={styles.priorityIcon}
              />
            )}
          </View>

          {/* Description */}
          {task.description && (
            <Text style={[
              styles.description,
              { 
                color: theme.textSecondary,
                textDecorationLine: task.completed ? 'line-through' : 'none'
              }
            ]}>
              {task.description}
            </Text>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {task.tags.slice(0, 3).map((tag, index) => (
                <View 
                  key={index}
                  style={[styles.tag, { backgroundColor: theme.primary + '20' }]}
                >
                  <Text style={[styles.tagText, { color: theme.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
              {task.tags.length > 3 && (
                <Text style={[styles.moreTagsText, { color: theme.textSecondary }]}>
                  +{task.tags.length - 3} more
                </Text>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            {/* Due Date */}
            {dueDateInfo && (
              <View style={styles.dueDateContainer}>
                <Icon name="schedule" size={14} color={dueDateInfo.color} />
                <Text style={[styles.dueDateText, { color: dueDateInfo.color }]}>
                  {dueDateInfo.text}
                </Text>
              </View>
            )}

            {/* Reminder Indicator */}
            {task.hasReminder && (
              <Icon name="notifications" size={14} color={theme.primary} />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(task)}
          >
            <Icon name="edit" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(task.id)}
          >
            <Icon name="delete" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  completeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityIcon: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default TaskItem;