import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../themes/ThemeContext';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskComplete,
  setFilter,
  setSortBy
} from '../../store/slices/tasksSlice';
import TaskItem from '../../components/tasks/TaskItem';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskFilterBar from '../../components/tasks/TaskFilterBar';

const TasksScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { items: tasks, isLoading, filter, sortBy } = useSelector(state => state.tasks);
  const { user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Mock tasks data for planner application
  const [mockTasks, setMockTasks] = useState([
    {
      id: '1',
      title: 'Complete Q4 Financial Report',
      description: 'Prepare and submit the quarterly financial report with all department inputs',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'work',
      tags: ['finance', 'quarterly', 'urgent'],
      completed: false,
      progress: 65,
    },
    {
      id: '2',
      title: 'Plan Team Building Event',
      description: 'Organize December team building activity - venue, catering, activities',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'team',
      tags: ['team', 'event', 'planning'],
      completed: false,
      progress: 20,
    },
    {
      id: '3',
      title: 'Review Code Documentation',
      description: 'Update API documentation for version 2.0 release',
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'development',
      tags: ['documentation', 'api', 'development'],
      completed: false,
      progress: 45,
    },
    {
      id: '4',
      title: 'Client Presentation Preparation',
      description: 'Prepare slides and demo for upcoming client meeting on Friday',
      priority: 'critical',
      status: 'todo',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'client',
      tags: ['presentation', 'client', 'urgent'],
      completed: false,
      progress: 10,
    },
    {
      id: '5',
      title: 'Update Personal Portfolio',
      description: 'Add recent projects and update skills section',
      priority: 'low',
      status: 'todo',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'personal',
      tags: ['portfolio', 'personal'],
      completed: false,
      progress: 0,
    },
    {
      id: '6',
      title: 'Weekly Grocery Shopping',
      description: 'Buy groceries for the week - check list in notes',
      priority: 'medium',
      status: 'completed',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'personal',
      tags: ['shopping', 'personal'],
      completed: true,
      progress: 100,
    },
    {
      id: '7',
      title: 'Schedule Annual Health Checkup',
      description: 'Book appointment for annual health screening',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'health',
      tags: ['health', 'appointment'],
      completed: false,
      progress: 0,
    },
    {
      id: '8',
      title: 'Backup Important Files',
      description: 'Create backup of all important documents and project files',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'maintenance',
      tags: ['backup', 'important'],
      completed: false,
      progress: 30,
    },
  ]);

  useEffect(() => {
    // Use mock data if no tasks from Redux store
    if (!tasks || tasks.length === 0) {
      // Dispatch mock tasks to Redux store for consistency
      // In real app, this would be fetchTasks()
    }
  }, [user?.id, dispatch, tasks]);

  // Use mockTasks if no tasks from Redux store
  const displayTasks = tasks && tasks.length > 0 ? tasks : mockTasks;

  const filteredTasks = displayTasks
    .filter(task => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      switch (filter) {
        case 'pending':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'today':
          return task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
        case 'week':
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return task.dueDate && new Date(task.dueDate) <= weekFromNow;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleCreateTask = (taskData) => {
    dispatch(createTask(taskData));
    setShowCreateModal(false);
  };

  const handleToggleComplete = (taskId, completed) => {
    dispatch(toggleTaskComplete({ taskId, completed: !completed }));
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowCreateModal(true);
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteTask(taskId))
        },
      ]
    );
  };

  const renderTaskItem = ({ item }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleComplete}
      onEdit={handleEditTask}
      onDelete={handleDeleteTask}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="assignment" size={80} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No tasks yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Create your first task to get started
      </Text>
      <TouchableOpacity
        style={[styles.createFirstTaskButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={[styles.createFirstTaskButtonText, { color: theme.textInverse }]}>
          Create Task
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Icon name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Bar */}
      <TaskFilterBar />

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredTasks.length === 0 && styles.listContainerEmpty
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchTasks())}
      />

      {/* Floating Action Button */}
      {filteredTasks.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color={theme.textInverse} />
        </TouchableOpacity>
      )}

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTask(null);
        }}
        onSave={handleCreateTask}
        task={selectedTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  listContainerEmpty: {
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  createFirstTaskButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createFirstTaskButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default TasksScreen;