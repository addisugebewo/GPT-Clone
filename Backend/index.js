// Load environment variables from .env
import "dotenv/config";

// Import required packages
import express from "express";
import cors from "cors";

// Import database configuration
import db from "./db/db.config.js";

// Import middleware and API routes
import errorHandler from "./src/middleware/error-handler.js";
import mainRouter from "./src/Api/main.routes.js";

// Create Express application
const app = express();

// Configure CORS to allow requests from our frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

// Middleware to read JSON request bodies
app.use(express.json());

// Log incoming requests for development
app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.url);

  next();
});

// Register API routes
app.use("/api", mainRouter);

// Global error-handling middleware
app.use(errorHandler);

// Get the port provided by Render or use 3400 locally
const PORT = process.env.PORT || 3400;

// Start the backend server
async function startServer() {
  try {
    // Test database connection
    const connection = await db.getConnection();

    connection.release();

    console.log("Database connection successful");

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
    process.exit(1);
  }
}

// Execute server startup function
startServer();
