import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../themes/ThemeContext';
import { useSelector } from 'react-redux';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TasksScreen from '../screens/main/TasksScreen';

// Screens (placeholder components for now)
const PlannerScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenText, { color: theme.text }]}>📅 Planner</Text>
    </View>
  );
};

const RemindersScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenText, { color: theme.text }]}>🔔 Reminders</Text>
    </View>
  );
};

const ProfileScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenText, { color: theme.text }]}>👤 Profile</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Planner':
              iconName = 'calendar-today';
              break;
            case 'Tasks':
              iconName = 'check-circle';
              break;
            case 'Reminders':
              iconName = 'notifications';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 18,
          fontWeight: '700',
        },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen 
        name="Planner" 
        component={PlannerScreen}
        options={{ title: 'Planner' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Reminders" 
        component={RemindersScreen}
        options={{ title: 'Reminders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const user = useSelector(state => state.auth.user);

  return (
    <NavigationContainer
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Auth Navigator
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AppNavigator;