import {
  createConversationService,
  getConversationsRows,
} from "../Service/Chat.serviese.js";

// POST: Create a new conversation
async function createConversationsController(req, res, next) {
  try {
    console.log("Full Request Body:", req.body);

    const { question } = req.body;

    console.log("Controller Question:", question);

    const result = await createConversationService(question);

    return res.status(201).json({
      success: true,
      message: "Chat saved to DB",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// GET: Get conversations
async function getConversationsController(req, res, next) {
  try {
    const result = await getConversationsRows(100);

    return res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Export controllers
export { createConversationsController, getConversationsController };
