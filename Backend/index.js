import "dotenv/config";// envaroment variable load

import express from "express"; //for backend
import cors from "cors"; //for cross origin resource sharing
import db from "./db/db.config.js";
import errorHandler from "./src/middleware/error-handler.js";
import mainRouter from "./src/Api/main.routes.js";
const app = express();
app.use(cors({
  origin: "*", // Allow requests from any origin
})); // Enable CORS for all routes


app.use(express.json());
app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Request Body:", req.body);

  next();
});

app.use("/api", mainRouter);//
// Error handling middleware
app.use(errorHandler);
async function starserver() {
  try {
    const connection = await db.getConnection();
   
connection.release();// Check if the connection is successful
    console.log("Database connection successful");


    app.listen(3400, (err) => {
      if (err) {
        throw err;
      }
      console.log("Server is running on port http://localhost:3400");
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
  }
}

starserver();



