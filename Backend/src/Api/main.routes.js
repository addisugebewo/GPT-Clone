// this file is used to define the main routes for the API. It imports the necessary modules and sets up the router for handling requests.

import chatRouter from "./Chat/Chat.route.js";
import express from "express";
// import db from "./db/db.config.js";
const mainRouter = express.Router();
// Define a route for the root path ("/") that sends a welcome message as a response.
mainRouter.use("/chat", chatRouter);


export default mainRouter;