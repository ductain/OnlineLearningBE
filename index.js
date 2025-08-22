require('dotenv').config();
const express = require('express');
const cors = require("cors");
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET,POST,PUT,DELETE",
  })
);
app.use(express.json());
const config = require('./config/default');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const teacherRoute = require('./routes/teacher');
const studentRoute = require('./routes/student');
const bookingRoute = require('./routes/booking');
const purchaseRoute = require('./routes/purchase');
const packageRoute = require('./routes/package');

app.use('/api/v1/teachers', teacherRoute);
app.use('/api/v1/students', studentRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/purchases', purchaseRoute);
app.use('/api/v1/packages', packageRoute);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Learning API',
      version: '1.0.0',
      description: 'API documentation for Online Learning',
    },
    servers: [
      { url: 'http://localhost:' + config.port },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
}); 