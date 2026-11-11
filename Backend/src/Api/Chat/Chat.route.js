import express from "express";
// import db from "./db/db.config.js";
const chatRouter = express.Router();
import { getConversationsController , createConversationsController} from "./Controller/Chat.Controller.js";
//api/chat/conversations
chatRouter.post("/conversations", createConversationsController);



chatRouter.get("/conversations", getConversationsController);// used to get the conversations from the database


export default chatRouter;