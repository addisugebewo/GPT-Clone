
// Import React hooks
import { useState, useEffect, useRef } from 'react';

// Axios is used to send HTTP requests from React to the backend API
import axios from 'axios';

// Import the reusable components of our GPT Clone application
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';


import './App.css';

// Base URL of our backend API
// All API requests will use this URL
const API_BASE_URL = "http://localhost:3400/api";

function App() {

  // Store all user and assistant conversations
  const [conversations, setConversations] = useState([]);

  // Track whether the application is waiting for a response from Gemini
 
  const [isLoading, setIsLoading] = useState(false);

  // useRef creates a reference to the bottom of the message list
  // We use it to automatically scroll down when new messages appear
  const messagesEndRef = useRef(null);


  // FUNCTION 1: Automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };


  // FUNCTION 2: Load previous conversations when the application starts
  useEffect(() => {
    fetchConversations();
  }, []);

  // FUNCTION 3: Scroll to the bottom whenever conversations or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);


  // FUNCTION 4: Fetch conversation history from the backend
  const fetchConversations = async () => {
    try {

      // Send a GET request to retrieve previous conversations
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations`
      );

      // Check whether the backend request was successful
      if (response.data.success) {

        // Save the retrieved conversations in React state
        setConversations(response.data.data);
      }

    } catch (error) {

      // Display an error in the browser console if the request fails
      console.error("Error fetching conversations:", error);
    }
  };


  // FUNCTION 5: Send a new user message to the backend
  const handleSendMessage = async (question) => {

    // Create a temporary user message
    // Date.now() generates a unique ID for displaying the message immediately
    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    // Immediately display the user's message in the chat interface
    // This improves the user experience while waiting for the backend
    setConversations((prev) => [...prev, tempUserMessage]);

    // Activate the loading state while waiting for Gemini's response
    setIsLoading(true);

    try {

      // Send the user's question to the backend using a POST request
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations`,
        {
          question,
        }
      );

      // Check whether the backend successfully processed the question
      if (response.data.success) {

        // Extract the saved user message and Gemini's response
        const { userMessage, assistantMessage } = response.data.data;

        // Update the conversation list
        setConversations((prev) => {

          // Remove the temporary message because the backend
          // has now returned the actual saved user message
          const filtered = prev.filter(
            (msg) => msg.id !== tempUserMessage.id
          );

          // Add the actual user message and assistant response
          return [...filtered, userMessage, assistantMessage];
        });
      }

    } catch (error) {

      // Handle errors if the backend or Gemini API request fails
      console.error("Error posting conversation:", error);

      // Get the error message from the backend if available
      // Otherwise, display a default error message
      const errorMessage =
        error.response?.data?.message ||
        "There was an error generating a response.";

      // Remove the temporary user message and display the error
      // as an assistant message in the chat interface
      setConversations((prev) => [
        ...prev.filter((msg) => msg.id !== tempUserMessage.id),
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
        },
      ]);

    } finally {

      // Stop the loading state whether the request succeeds or fails
      setIsLoading(false);
    }
  };


  // MAIN UI: Render the complete GPT Clone application
  return (
    <div className='app'>

      {/* Sidebar: Displays the application sidebar and navigation */}
      <Sidebar />

      {/* Main chat area */}
      <main className='chat'>

        {/* ChatHeader: Displays the chat header section */}
        <ChatHeader />

        {/* MessageList: Displays user messages and assistant responses */}
        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        {/* ChatInput: Allows users to type and send new questions */}
        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />

      </main>
    </div>
  );
}

// Export App so it can be imported and rendered by main.jsx
export default App;
