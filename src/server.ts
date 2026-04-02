import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import compression from 'compression'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './config/db';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/property';
import inquiryRoutes from './routes/inquiry';
import notFoundHandler from './middleware/notFound';
import { errorHandler } from './middleware/error';


connectDB();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const rateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Too much requests',
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(rateLimit(rateLimitOptions));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.get('/', (_, res) => {
  res.json({ message: 'API is running', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/inquiry', inquiryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}/`);
});

export default app;