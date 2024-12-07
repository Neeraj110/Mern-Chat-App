import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ChatHeader from "./subComponents/ChatHeader";
import ChatMessage from "./subComponents/ChatMessage";
import ChatInput from "./subComponents/ChatInput";
import NoChatSelected from "./subComponents/NoChatSelected";
import { fetchMessagesAPI } from "../hooks/MessageApi";
import io from "socket.io-client";

const socketEndpoint = import.meta.env.VITE_API_URI || "http://localhost:8000";
let socket;

function ChatPage() {
  const { isDarkMode } = useSelector((state) => state.theme);
  const { selectedConversation } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const fetchedMessages = await fetchMessagesAPI(selectedConversation);
      setMessages(fetchedMessages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (!socket) {
      socket = io(socketEndpoint);

      if (user) {
        socket.emit("setup", user);
        socket.on("connected", () => {
          setSocketConnected(true);
        });
      }

      socket.on("onlineUsers", (users) => {
        console.log("Online Users:", users);

        setOnlineUsers(users);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !selectedConversation) {
      console.log("Socket not ready or no conversation selected", {
        socket: !!socket,
        conversation: !!selectedConversation,
      });
      return;
    }

    socket.emit("join chat", selectedConversation._id);

    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => {
        return [...prevMessages, newMessage];
      });
    };

    const handleTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("new message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("new message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
    };
  }, [selectedConversation]);

  useEffect(() => {
    fetchMessages();
  }, [selectedConversation]);

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
            socket={socket}
          />
        </>
      ) : (
        <NoChatSelected isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default ChatPage;
