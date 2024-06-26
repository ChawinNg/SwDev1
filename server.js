const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const connectDB = require("./config/db");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const mongoSanitize = require("express-mongo-sanitize");

const swaggerUI = require("swagger-ui-express");

const providers = require("./routes/providers.js");
const auth = require("./routes/auth");
const favorite = require("./routes/favorites.js");
const bookings = require("./routes/bookings.js")

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(xss());
app.use(helmet());
app.use(limiter);
app.use(hpp());

app.use(mongoSanitize());
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

app.use("/api/v1/providers", providers);
app.use("/api/v1/auth", auth);
app.use("/api/v1/favorites", favorite);
app.use("/api/v1/bookings", bookings);


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, " mode on port", PORT)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
