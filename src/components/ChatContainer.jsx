import React from "react";
import ChatMessage from "./ChatMessage";

const ChatContainer = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg, index) => (
            
          <ChatMessage
            key={index}
            message={msg.content}
            isUser={msg.isUser}
          />
        ))
      )}
    </div>
  );
};

export default ChatContainer;