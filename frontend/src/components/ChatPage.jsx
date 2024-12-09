
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatHeader from "./subComponents/ChatHeader";
import ChatMessage from "./subComponents/ChatMessage";
import ChatInput from "./subComponents/ChatInput";
import NoChatSelected from "./subComponents/NoChatSelected";
import { fetchMessagesAPI } from "../hooks/MessageApi";
import io from "socket.io-client";

const socketEndpoint = import.meta.env.VITE_API_URI;

function ChatPage() {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { selectedConversation } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch messages for the selected conversation
  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const fetchedMessages = await fetchMessagesAPI(selectedConversation);
      setMessages(fetchedMessages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle new message from the socket
  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Handle typing indicator
  const handleTyping = () => setIsTyping(true);
  const handleStopTyping = () => setIsTyping(false);

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(socketEndpoint);
      const socket = socketRef.current;

      if (user) {
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("onlineUsers", (users) => setOnlineUsers(users));
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Join selected conversation and set up socket listeners
  useEffect(() => {
    if (!socketRef.current || !selectedConversation) return;

    const socket = socketRef.current;
    socket.emit("join chat", selectedConversation._id);

    socket.on("new message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("new message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [selectedConversation]);

  // Fetch messages whenever the selected conversation changes
  useEffect(() => {
    setMessages([]); // Clear messages immediately
    fetchMessages();
  }, [selectedConversation]);

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex flex-col w-full p-2 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {selectedConversation ? (
        <>
          <ChatHeader
            isDarkMode={isDarkMode}
            selectedConversation={selectedConversation}
            onlineUsers={onlineUsers}
          />
          <ChatMessage
            isDarkMode={isDarkMode}
            messages={messages}
            messagesEndRef={messagesEndRef}
            isTyping={isTyping}
          />
          <ChatInput
            isDarkMode={isDarkMode}
            selectedConversation={selectedConversation}
            fetchMessages={fetchMessages}
            socket={socketRef.current}
          />
        </>
      ) : (
        <NoChatSelected isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default ChatPage;
