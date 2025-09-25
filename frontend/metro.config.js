const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only override expo-font for web platform to prevent registerWebModule error
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'expo-font': require.resolve('./src/utils/expo-font-override.js')
  };
}

module.exports = config;