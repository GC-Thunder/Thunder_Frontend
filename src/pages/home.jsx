import React, { useState } from 'react';
import ChatSideBar from '../components/chatSideBar';
import LlmConfig from '../components/llmConfig';
import ChatInput from '../components/ChatInput';
import ChatContainer from '../components/ChatContainer';
import { useCurrentChatMap } from '../Context/context';

const Home = () => {
  const { currentChatMap,setCurrentChatMap } = useCurrentChatMap();
  console.log(currentChatMap)
  const [messages, setMessages] = useState([]);

  // Mock LLM response - replace with actual API call
  const getLlmResponse = async (userInput) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just echo the input
    // Replace with actual API call to your LLM service
    return `This is a response to: "${userInput}"`;
  };

  const handleSendMessage = async (userInput) => {
    // Add user message to chat
    const userMessage = { text: userInput, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Get response from LLM
    try {
      const response = await getLlmResponse(userInput);
      
      // Add LLM response to chat
      const llmMessage = { text: response, isUser: false };
      setMessages(prevMessages => [...prevMessages, llmMessage]);
    } catch (error) {
      console.error("Error getting LLM response:", error);
      const errorMessage = { text: "Sorry, I couldn't process your request.", isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="wrapper flex w-[100vw] justify-between">
      <ChatSideBar />
      <div className="bg-gradient-to-b from-blue-50 to-blue-200 h-[100vh] w-screen md:w-[86vw] shadow-inner flex flex-col justify-between">
        <div className=" flex flex-col">
          <div className="p-4">
            <LlmConfig />
          </div>
          
          <div className=" overflow-hidden flex flex-col h-[35vw] ">
            <ChatContainer messages={currentChatMap} />
          </div>
          
          <div className="p-4">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;