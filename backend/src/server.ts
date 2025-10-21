import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { createConnection } from './config/database';
import routes from './routes/index';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    await createConnection();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting the server:', error);
  }
};

startServer();

export default app;
