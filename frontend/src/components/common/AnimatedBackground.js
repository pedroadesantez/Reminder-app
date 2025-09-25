import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../themes/ThemeContext';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = ({ children, variant = 'default' }) => {
  const { theme, isDarkMode } = useTheme();

  // Animation values
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start particle animations
    const createParticleAnimation = (animValue, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Glow effect animation
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Wave animation
    const waveAnim = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Start all animations
    Animated.parallel([
      createParticleAnimation(particle1, 4000),
      createParticleAnimation(particle2, 5000),
      createParticleAnimation(particle3, 6000),
      glowAnim,
      waveAnim,
    ]).start();
  }, []);

  const getGradientColors = () => {
    if (variant === 'auth') {
      return isDarkMode
        ? ['#0f0c29', '#302b63', '#24243e']
        : ['#667eea', '#764ba2', '#f093fb'];
    } else if (variant === 'planner') {
      return isDarkMode
        ? ['#141e30', '#243b55', '#1e3c72']
        : ['#4facfe', '#00f2fe', '#43e97b'];
    } else if (variant === 'tasks') {
      return isDarkMode
        ? ['#232526', '#414345', '#2c3e50']
        : ['#ffecd2', '#fcb69f', '#ff9a9e'];
    } else if (variant === 'reminders') {
      return isDarkMode
        ? ['#0f2027', '#203a43', '#2c5364']
        : ['#a8edea', '#fed6e3', '#ffeaa7'];
    } else {
      return isDarkMode
        ? ['#1a1a2e', '#16213e', '#0f3460']
        : ['#6dd5ed', '#2193b0', '#3a7bd5'];
    }
  };

  const particle1Transform = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const particle2Transform = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const particle3Transform = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const waveTransform = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Particles */}
      <Animated.View
        style={[
          styles.particle,
          {
            transform: [{ translateY: particle1Transform }],
            left: '20%',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.particle,
          {
            transform: [{ translateX: particle2Transform }],
            top: '30%',
            backgroundColor: isDarkMode ? 'rgba(100, 200, 255, 0.1)' : 'rgba(100, 200, 255, 0.3)',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.particle,
          {
            transform: [{ translateX: particle3Transform }],
            bottom: '20%',
            backgroundColor: isDarkMode ? 'rgba(255, 100, 200, 0.1)' : 'rgba(255, 100, 200, 0.3)',
          },
        ]}
      />

      {/* Glowing Orbs */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            opacity: glowOpacity,
            top: '10%',
            right: '10%',
            backgroundColor: isDarkMode ? '#4a69bd' : '#74b9ff',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.glowOrb,
          {
            opacity: glowOpacity,
            bottom: '15%',
            left: '15%',
            backgroundColor: isDarkMode ? '#6c5ce7' : '#a29bfe',
            width: 150,
            height: 150,
          },
        ]}
      />

      {/* Wave Effect */}
      <Animated.View
        style={[
          styles.wave,
          {
            transform: [{ rotate: waveTransform }],
          },
        ]}
      >
        <LinearGradient
          colors={isDarkMode
            ? ['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']
            : ['transparent', 'rgba(255, 255, 255, 0.2)', 'transparent']
          }
          style={styles.waveGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Glassmorphic overlay for content */}
      <View style={styles.glassOverlay} />

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 10,
  },
  wave: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    left: -width / 2,
    top: -width / 2,
  },
  waveGradient: {
    flex: 1,
    borderRadius: width,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
});

export default AnimatedBackground;