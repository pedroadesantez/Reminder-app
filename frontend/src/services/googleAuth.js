import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

class GoogleAuthService {
  constructor() {
    this.clientId = Platform.select({
      ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
      android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      web: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
      default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    });

    this.discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  }

  async signInAsync() {
    try {
      const authRequestConfig = {
        clientId: this.clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
      };

      const authRequest = new AuthSession.AuthRequest(authRequestConfig);

      const result = await authRequest.promptAsync(this.discovery);

      if (result.type === 'success') {
        const { authentication } = result;

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          success: true,
          user: userInfo,
          accessToken: authentication.accessToken,
          idToken: authentication.idToken,
        };
      } else {
        return {
          success: false,
          error: 'Authentication was cancelled or failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async exchangeCodeForToken(code) {
    try {
      // This should be called on your backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }
}

export default new GoogleAuthService();