require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://online-learning-be.vercel.app",
  "https://online-learning-fe.vercel.app/",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET,POST,PUT,DELETE",
  })
);

// Stripe webhook route - must be before express.json() middleware
const purchaseController = require("./controllers/purchaseController");
app.post("/api/v1/purchases/webhook", express.raw({ type: 'application/json' }), purchaseController.handleWebhook);

app.use(express.json());
const config = require("./config/default");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const teacherRoute = require("./routes/teacher");
const studentRoute = require("./routes/student");
const bookingRoute = require("./routes/booking");
const purchaseRoute = require("./routes/purchase");
const packageRoute = require("./routes/package");

app.use("/api/v1/teachers", teacherRoute);
app.use("/api/v1/students", studentRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/purchases", purchaseRoute);
app.use("/api/v1/packages", packageRoute);

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.9/swagger-ui.min.css";
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Learning API",
      version: "1.0.0",
      description: "API documentation for Online Learning",
    },
    servers: [{ url: "http://localhost:" + config.port }, {url: "https://online-learning-be.vercel.app"}],
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
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customCssUrl: CSS_URL })
);

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
