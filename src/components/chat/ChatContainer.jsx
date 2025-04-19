import React, { useEffect, useRef } from 'react';

const ChatContainer = ({ messages, waitingForFirstChunk, loadingComponent }) => {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages && messages.map((message, index) => (
        <div 
          key={index} 
          className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
        >
          <div 
            className={`inline-block p-3 rounded-lg max-w-[80%] ${
              message.isUser 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {message.content}
            
            {/* Show loading animation for the last AI message when waiting for first chunk */}
            {!message.isUser && 
             index === messages.length - 1 && 
             waitingForFirstChunk && 
             loadingComponent}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;