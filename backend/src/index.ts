import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { uploadRoutes } from './routes/upload.js';
import { generationRoutes } from './routes/generation.js';
import { stylesRoutes } from './routes/styles.js';
import { materialsRoutes } from './routes/materials.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { Database } from './services/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database on startup
Database.initializeDatabase().catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// CORS configuration - allow localhost on any port for development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and 127.0.0.1 on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // In production, check against FRONTEND_URL
    if (process.env.NODE_ENV === 'production' && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Allow in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/generate', authMiddleware, generationRoutes);
app.use('/api/styles', stylesRoutes);
app.use('/api/materials', materialsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SPAVIX API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
