import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import billsRoutes from './routes/bills';
import itemsRoutes from './routes/items';
import participantsRoutes from './routes/participants';
import ocrRoutes from './routes/ocr';
import assignmentsRoutes from './routes/assignments';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', uploadsDir)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/bills', billsRoutes);
app.use('/api', itemsRoutes);
app.use('/api', participantsRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/assignments', assignmentsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BillSense API server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.resolve(uploadsDir)}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
