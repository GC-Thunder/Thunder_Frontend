import React from "react";
import { useState } from "react";

const ChatInput = ({ onSendMessage,theme }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      
      onSendMessage(inputValue);
     
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  const themePreset = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black';
  const themeContrast2 = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500';
  const buttonTheme = theme === 'dark' ? 'bg-gray-200' : 'bg-gray-700';
  const buttonHoverTheme = theme === 'dark' ? 'hover:bg-gray-300' : 'hover:bg-gray-600';
  return (
    <div className={`relative ${themePreset} rounded-full shadow-md p-1 flex items-center w-full`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full  ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${themeContrast2}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="flex-1 px-4">
        <input
          type="text"
          placeholder="Hi User, how can I help you today?"
          className={`w-full outline-none text-sm ${themePreset} rounded-full p-2  overflow-x-break-words text-overflow: ellipsis`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <button 
        className={`rounded-full p-2 mr-1 cursor-pointer ${buttonTheme} ${buttonHoverTheme} transition duration-200 ease-in-out`}
        onMouseDown={(e) => e.preventDefault()} // Prevents the button from losing focus 
        onClick={handleSubmit}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;