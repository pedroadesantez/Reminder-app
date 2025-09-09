import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../themes/ThemeContext';
import { setFilter, setSortBy } from '../../store/slices/tasksSlice';

const TaskFilterBar = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { filter, sortBy } = useSelector(state => state.tasks);

  const filters = [
    { key: 'all', label: 'All', icon: 'view-list' },
    { key: 'pending', label: 'Pending', icon: 'radio-button-unchecked' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'week', label: 'This Week', icon: 'date-range' },
  ];

  const sortOptions = [
    { key: 'createdAt', label: 'Recent', icon: 'access-time' },
    { key: 'dueDate', label: 'Due Date', icon: 'schedule' },
    { key: 'priority', label: 'Priority', icon: 'flag' },
    { key: 'title', label: 'A-Z', icon: 'sort-by-alpha' },
  ];

  return (
    <View>
      {/* Filter Row */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === filterOption.key ? theme.primary : theme.surface,
                borderColor: filter === filterOption.key ? theme.primary : theme.border,
              }
            ]}
            onPress={() => dispatch(setFilter(filterOption.key))}
          >
            <Icon 
              name={filterOption.icon} 
              size={16} 
              color={filter === filterOption.key ? theme.textInverse : theme.text}
            />
            <Text style={[
              styles.filterButtonText,
              { color: filter === filterOption.key ? theme.textInverse : theme.text }
            ]}>
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Row */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterContainer, styles.sortContainer]}
      >
        <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>
          Sort by:
        </Text>
        {sortOptions.map((sortOption) => (
          <TouchableOpacity
            key={sortOption.key}
            style={[
              styles.sortButton,
              {
                backgroundColor: sortBy === sortOption.key ? theme.secondary : 'transparent',
                borderColor: sortBy === sortOption.key ? theme.secondary : theme.border,
              }
            ]}
            onPress={() => dispatch(setSortBy(sortOption.key))}
          >
            <Icon 
              name={sortOption.icon} 
              size={14} 
              color={sortBy === sortOption.key ? theme.textInverse : theme.textSecondary}
            />
            <Text style={[
              styles.sortButtonText,
              { color: sortBy === sortOption.key ? theme.textInverse : theme.textSecondary }
            ]}>
              {sortOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sortContainer: {
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default TaskFilterBar;