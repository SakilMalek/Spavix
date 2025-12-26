import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database } from '../services/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/signup', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Database.createUser(email, passwordHash);

    const token = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

authRoutes.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await Database.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

authRoutes.post('/google', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name, picture } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    let user = await Database.getUserByEmail(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const newUser = await Database.createUser(email, passwordHash, name, picture);
      user = {
        id: newUser.id,
        email,
        password_hash: passwordHash,
        name: name || undefined,
        picture: picture || undefined,
      };
    } else {
      if (name || picture) {
        await Database.updateUserProfile(user.id, name, picture);
      }
      user = {
        ...user,
        name: name || user.name,
        picture: picture || user.picture,
      };
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
        picture: user.picture || null,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed', details: String(error) });
  }
});

authRoutes.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await Database.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});
