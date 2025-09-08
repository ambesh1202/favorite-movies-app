require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const uploadsRoutes = require('./routes/uploads');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use(rateLimit({ windowMs: 1*60*1000, max: 100 }));

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'Movies API', version: '1.0.0' }
  },
  apis: ['./src/routes/*.js']
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entries', entriesRoutes);
app.use('/api/v1/uploads', uploadsRoutes);

app.get('/', (req,res) => res.send('Movies API'));

module.exports = app;
