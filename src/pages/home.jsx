import React, { useState, useEffect } from 'react';
import ChatSideBar from '../components/chatSideBar';
import LlmConfig from '../components/llmConfig';
import ChatInput from '../components/ChatInput';
import ChatContainer from '../components/ChatContainer';
import { useCurrentChatMap } from '../Context/context';
import { useToggleMenu } from '../Context/context';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const LLM_URL = 'http://localhost:4000/chat';

const Home = () => {
  const { currentChatIndex, setCurrentChatIndex } = useCurrentChatMap();
  const { chats, setChats, loading } = useToggleMenu();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 735) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLlmResponse = async (userInput) => {
    return `response for ${userInput}`;
  };

  const handleSendMessage = async (userInput) => {
    if (!chats.length) {
      console.log('Making new chat with initial message:', userInput);
      await createNewChat(userInput);
      return;
    }

    const currentChat = chats[currentChatIndex];

    const userMessage = {
      isUser: true,
      content: userInput,
      timestamp: new Date()
    };

    // Update UI immediately with user message
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      updatedChats[currentChatIndex] = {
        ...updatedChats[currentChatIndex],
        messages: [...updatedChats[currentChatIndex].messages, userMessage]
      };
      return updatedChats;
    });

    try {
      // Send message to API
      await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, userMessage);

      // Get LLM response
      const llmRes = await getLlmResponse(userInput);

      const llmMsg = {
        isUser: false,
        content: llmRes,
        timestamp: new Date()
      };

      // Update UI with LLM response
      setChats(prevChats => {
        const updatedChats = [...prevChats];
        updatedChats[currentChatIndex] = {
          ...updatedChats[currentChatIndex],
          messages: [...updatedChats[currentChatIndex].messages, llmMsg]
        };
        return updatedChats;
      });

      // Send LLM response to API
      await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, llmMsg);
    } catch (err) {
      console.error('Error in handling message', err);
    }
  };

  const createNewChat = async (initialMessage = null) => {
    try {
      console.log('Starting to create new chat...');
      const userId = "user123";

      // Initial messages array
      const initialMessages = initialMessage ? [
        {
          isUser: true,
          content: initialMessage,
          timestamp: new Date()
        }
      ] : [];

      const newChat = {
        title: `New Chat ${chats.length + 1}`,
        userId: userId,
        messages: initialMessages
      };

      console.log('Sending new chat request to API:', newChat);
      
      // Create chat in database
      const response = await axios.post(`${API_URL}/chats`, newChat);
      
      // Log the full response to understand its structure
      console.log('API Response:', response);
      
      if (response && response.data) {
        console.log('Response data:', response.data.sucess);
        
        if (response.data.sucess) {
          console.log('New chat created successfully with ID:', response.data.data._id);
          const createdChat = response.data.data;
          
          // Make sure the messages array exists
          if (!createdChat.messages) {
            createdChat.messages = [];
          }
          
          // If we have an initial message, add it to messages if not already there
          if (initialMessage && !createdChat.messages.some(msg => msg.content === initialMessage && msg.isUser === true)) {
            const userMsg = {
              isUser: true,
              content: initialMessage,
              timestamp: new Date()
            };
            createdChat.messages.push(userMsg);
            
            // Add message to backend if needed
            try {
              await axios.post(`${API_URL}/chats/${createdChat._id}/messages`, userMsg);
              console.log('Added initial user message to chat');
            } catch (msgError) {
              console.error('Error adding initial user message:', msgError);
            }
          }
          
          // Get LLM response for initial message
          if (initialMessage) {
            try {
              console.log('Getting LLM response for:', initialMessage);
              const llmRes = await getLlmResponse(initialMessage);
              
              const llmMsg = {
                isUser: false,
                content: llmRes,
                timestamp: new Date()
              };
              
              // Add LLM message to the chat object
              createdChat.messages.push(llmMsg);
              console.log('Added LLM response to chat object');
              
              // Send LLM response to API
              await axios.post(`${API_URL}/chats/${createdChat._id}/messages`, llmMsg);
              console.log('Saved LLM response to database');
            } catch (llmError) {
              console.error('Error getting or saving LLM response:', llmError);
            }
          }
          
          console.log('Final chat object to update UI with:', createdChat);
          
          // Update chats state - do this synchronously to ensure state is updated immediately
          const newChats = [...chats, createdChat];
          const newIndex = newChats.length - 1;
          
          setChats(newChats);
          console.log('Updated chats state, new length:', newChats.length);
          
          setCurrentChatIndex(newIndex);
          console.log('Set current chat index to:', newIndex);
        } else {
          console.error('API returned success: false. Response:', response.data);
        }
      } else {
        console.error('Invalid API response format:', response);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      console.error("Error details:", error.response ? error.response.data : 'No response data');
    }
  };

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="wrapper flex w-[100vw] justify-between h-screen">
      <button
        className="md:hidden fixed top-4 left-4 z-[999] cursor-pointer "
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        {/* Hamburger icon */}
        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-800"></div>
      </button>
      <ChatSideBar createNewChat={createNewChat} isMobileSidebarOpen={isMobileSidebarOpen} />
      <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-200 md:w-[76vw] md:ml-[24vw] shadow-inner w-[100vw]">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <LlmConfig />
          </div>

          <div className="overflow-hidden flex-1 flex flex-col">
            {chats.length > 0 ? (
              <ChatContainer messages={chats[currentChatIndex]?.messages || []} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No chats yet. Start a new conversation!</p>
              </div>
            )}
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