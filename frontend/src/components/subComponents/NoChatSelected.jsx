import React from "react";

function NoChatSelected({ isDarkMode }) {
  return (
    <div
      className={`flex items-center justify-center h-full ${
        isDarkMode ? "bg-gray-900 text-gray-400" : "bg-gray-100 text-gray-600"
      }`}
    >
      <p className="text-xl font-semibold">No conversation selected</p>
    </div>
  );
}

export default NoChatSelected;
