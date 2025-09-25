const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { generateTokens } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const prisma = new PrismaClient();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        darkMode: true,
        notifications: true,
        language: true,
        timezone: true,
        totalTasks: true,
        completedTasks: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const { accessToken } = generateTokens(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        darkMode: true,
        notifications: true,
        language: true,
        timezone: true,
        totalTasks: true,
        completedTasks: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const { accessToken } = generateTokens(user.id);

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        darkMode: true,
        notifications: true,
        language: true,
        timezone: true,
        totalTasks: true,
        completedTasks: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string().min(2).max(50),
      avatar: Joi.string().uri().allow(''),
      darkMode: Joi.boolean(),
      notifications: Joi.boolean(),
      language: Joi.string().max(10),
      timezone: Joi.string().max(50)
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: value,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        darkMode: true,
        notifications: true,
        language: true,
        timezone: true,
        totalTasks: true,
        completedTasks: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).max(128).required()
    });

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Update user with Google info if they don't have it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: picture || user.avatar
          },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            darkMode: true,
            notifications: true,
            language: true,
            timezone: true,
            totalTasks: true,
            completedTasks: true,
            currentStreak: true,
            longestStreak: true,
            totalPoints: true,
            createdAt: true
          }
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          avatar: picture,
          password: '' // Empty password for Google users
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          darkMode: true,
          notifications: true,
          language: true,
          timezone: true,
          totalTasks: true,
          completedTasks: true,
          currentStreak: true,
          longestStreak: true,
          totalPoints: true,
          createdAt: true
        }
      });
    }

    // Generate token
    const { accessToken } = generateTokens(user.id);

    res.json({
      message: 'Google authentication successful',
      user,
      accessToken
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    const { id_token } = tokens;

    // Use the existing googleAuth logic with the ID token
    req.body = { idToken: id_token };
    return googleAuth(req, res);

  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Google callback failed' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleAuth,
  googleCallback
};