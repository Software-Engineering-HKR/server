import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes/apiRoutes.js';
import authRouter from './routes/authRoutes.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
dotenv.config()

// Middleware
app.use(express.json());

// Routes
app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

export default app;