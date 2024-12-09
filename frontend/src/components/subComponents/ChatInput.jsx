import { useState } from "react";
import { sendMessageToAPI } from "../../hooks/MessageApi";
import { useSelector } from "react-redux";

function ChatInput({
  isDarkMode,
  selectedConversation,
  fetchMessages,
  socket,
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const currentUser = user;
  let typingTimeout;

  const handleTyping = () => {
    if (!isTyping) {
      socket.emit("typing", selectedConversation._id);
      setIsTyping(true);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop typing", selectedConversation._id);
      setIsTyping(false);
    }, 3000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    socket.emit("stop typing", selectedConversation._id);

    if (!message.trim()) return;

    const messageData = {
      _id: Date.now().toString(),
      message,
      createdAt: new Date().toISOString(),
      sender: {
        _id: currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email,
        avatar: currentUser?.avatar,
      },
      receiver: {
        _id: selectedConversation?._id,
        name: selectedConversation?.name,
        email: selectedConversation?.email,
        avatar: selectedConversation?.avatar,
      },
    };
    socket.emit("new message", {
      message: messageData,
      room: selectedConversation?._id,
    });
    setMessage("");
    try {
      setLoading(true);
      await sendMessageToAPI(selectedConversation, message);
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 border-gray-200 dark:border-gray-700">
      <form
        onSubmit={handleSend}
        className="flex items-center w-full space-x-2 sm:space-x-3"
      >
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          className={`flex-grow px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-600"
              : "bg-white border-gray-300 focus:ring-blue-500"
          }`}
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className={`px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg transition duration-300 ${
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } ${loading ? "opacity-50 cursor-wait" : ""} ${
            !message.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
