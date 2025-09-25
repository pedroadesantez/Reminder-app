// Override for expo-font to prevent registerWebModule errors on web
export const loadAsync = () => Promise.resolve();
export const isLoaded = () => true;
export const isLoading = () => false;

// Export everything else as no-ops or defaults
export default {
  loadAsync,
  isLoaded,
  isLoading,
};