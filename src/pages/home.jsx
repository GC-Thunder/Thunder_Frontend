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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 735) {
        setIsMobileSidebarOpen(false);
      }
      window.addEventListener('resize', handleResize)
      return window.removeEventListener('resize', handleResize)
    }
  })

  const getLlmResponse = async (userInput) => {
    // const res = await fetch(LLM_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ prompt: userInput }),
    // });
    // if (!res.ok){
    //   console.log("Error in response:", res.statusText);
    //   return `Sorry, I couldn't process your request.`;
    // }
    // const data = await res.json();


    return `response for ${userInput}`;
  };

  const handleSendMessage = async (userInput) => {
    if (!chats.length) {
      await createNewChat(userInput);
      return;
    }

    const currentChat = chats[currentChatIndex];

    const userMessage = {
      isUser: true,
      content: userInput,
      timestamp: new Date()
    };


    setChats(preChats => {
      const updatedChats = [...preChats];
      const updatedMsg = [...updatedChats[currentChatIndex].messages, userMessage]
      updatedChats[currentChatIndex] = {
        ...updatedChats[currentChat],
        messages: updatedMsg
      };
      return updatedChats

    })
    console.log('updated chats:', chats)
    try {
      await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, userMessage);

      const llmRes = await getLlmResponse(userInput);

      const llmMsg = {
        isUser: false,
        content: llmRes,
        timestamp: new Date()
      };

      setChats(prevChats => {
        const updatedChats = [...prevChats];
        console.log(updatedChats[currentChatIndex])
        const updatedMsgs = [...updatedChats[currentChatIndex].messages, llmMsg];
        updatedChats[currentChatIndex] = {
          ...updatedChats[currentChatIndex],
          messages: updatedMsgs
        };
        return updatedChats;
      })

      await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, llmMsg)
    } catch (err) {
      console.error('Error in handling message', err)
    }


  };

  const createNewChat = async (initialMessage = null) => {
    try {

      const userId = "user123";

      const newChat = {
        title: `New Chat ${chats.length + 1}`,
        userId: userId,
        messages: []
      };

      const response = await axios.post(`${API_URL}/chats`, newChat);

      if (response.data.success === true) {
        console.log('New chat created successfully');
        const createdChat = response.data.data;

        setChats(prevChats => {
          const updatedChats = [...prevChats, createdChat];
          console.log('Updated chats array:', updatedChats);


          const newIndex = updatedChats.length - 1;


          setTimeout(() => {
            setCurrentChatIndex(newIndex);


            if (initialMessage) {
              setTimeout(() => {
                handleSendMessage(initialMessage);
              }, 50);
            }
          }, 0);

          return updatedChats;
        });
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
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