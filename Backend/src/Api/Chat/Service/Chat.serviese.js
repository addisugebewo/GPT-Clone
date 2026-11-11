
import db from "../../../../db/db.config.js";
import ai from "../../../../config/gemini.config.js";
// using the gemini model from the environment variable or default to "gemini-3.5-flash-lite"
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// 1. Get conversations from database
export const getConversationsRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);

  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;
   // to sellect fromm data base   
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ?`,
    [safeLimit],
  );

  return rows;
};

// 2. Send message to Gemini with retry
const sendMessageWithRetry = async (chat, question) => {
  const attempts = 3;

  for (let i = 0; i < attempts; i++) {
    try {
      return await chat.sendMessage({
        message: question,
      });
    } catch (error) {
      const status = error.status || error.code;

      // Retry only temporary errors
      if (status !== 503 && status !== 429) {
        throw error;
      }

      if (i === attempts - 1) {
        throw error;
      }

      console.log(`Gemini retry attempt ${i + 1}`);

      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

// 3. Generate assistant answer
const generateAssistantAnswer = async (historyRows, question) => {
  const history = historyRows.reverse().map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  console.log("Using Gemini Model:", GEMINI_MODEL);

  const chat = ai.chats.create({
    model: GEMINI_MODEL,
    history,
  });

  const result = await sendMessageWithRetry(chat, question);

  return {
    text: result.text,
    totalTokens: result.usageMetadata?.totalTokenCount || 0,
  };
};

// 4. Get message by ID
const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, created_at
     FROM conversations
     WHERE id = ?
     LIMIT 1`,
    [messageId],
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

// 5. Create conversation
export async function createConversationService(question) {
  try {
    // Validate question
    if (typeof question !== "string" || !question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    const normalizedQuestion = question.trim();

    // Get previous conversations
    const rows = await getConversationsRows(5);

    // Save user question first
    const [userResult] = await db.execute(
      `INSERT INTO conversations (role, content, token_count)
       VALUES (?, ?, ?)`,
      ["user", normalizedQuestion, 0],
    );

    // Generate Gemini response
    const assistantResponse = await generateAssistantAnswer(
      rows,
      normalizedQuestion,
    );

    // Save assistant response
    const [assistantResult] = await db.execute(
      `INSERT INTO conversations (role, content, token_count)
       VALUES (?, ?, ?)`,
      ["assistant", assistantResponse.text, assistantResponse.totalTokens],
    );

    // Retrieve saved messages
    const userMessage = await getMessageById(userResult.insertId);
    const assistantMessage = await getMessageById(assistantResult.insertId);

    return {
      userMessage,
      assistantMessage,
      assistantAnswer: assistantResponse.text,
      totalTokens: assistantResponse.totalTokens,
    };
  } catch (error) {
    console.error("Chat Service Error:", error.message);
    throw error;
  }
}
