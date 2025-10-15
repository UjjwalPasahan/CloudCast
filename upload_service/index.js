import express from "express"
import uploadRouter from './routes/upload.routes.js'
import dotenv from "dotenv"
import cors from "cors"
import kafkaPublisherRouter from './routes/kafkapublisher.route.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Increase body size limits
app.use(cors({
   allowedHeaders: ["*"],
   origin: "*"
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/upload', uploadRouter);
app.use('/publish', kafkaPublisherRouter);

app.get('/', (req, res) => {
   res.json({
      status: 'ok',
      service: 'Upload Service',
      timestamp: new Date().toISOString()
   });
})

app.get('/health', (req, res) => {
   res.json({
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
   });
})

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Error:', err);
   res.status(500).json({
      error: 'Internal server error',
      message: err.message
   });
});

app.listen(port, () => {
   console.log(`Server is listening at http://localhost:${port}`);
})

export default app;