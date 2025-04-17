import { useState } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import plus from '../assets/plus.svg'
import clock from '../assets/clock.svg'
import star from '../assets/star.svg' 
import axios from 'axios'
import { useToggleMenu } from '../Context/context'

const API_URL = 'http://localhost:5000/api';

const ChatSideBar = ({ createNewChat, isMobileSidebarOpen }) => {
  const { chats, setChats } = useToggleMenu();
  const navigate = useNavigate();
  
  const deleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    try {
      await axios.delete(`${API_URL}/chats/${chatId}`);
      
      // Update local state
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      // If we deleted the chat we were viewing, navigate to another chat
      if (updatedChats.length > 0) {
        navigate(`/chat/${updatedChats[0].id}`);
      } else {
        // If no chats left, navigate to home
        navigate('/');
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const selectChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };
 
  return (
    <div className="wrapper h-[100vh]  absolute w-[70vw] md:w-[24vw]" style={{
      left: isMobileSidebarOpen ? '-700px' : '0px',
      transition: 'left 0.3s ease',
      zIndex: 55
    }}>
      <div className="rightMenu h-full w-full bg-white shadow-lg relative">
        <div className="absolute top-0 right-[-5px] h-full w-1 bg-white" style={{
          boxShadow: "2px 0px 8px 0px rgba(0,0,0,0.3)",
          zIndex: 10
        }}></div>
        <div className="py-10 innerWrapepr overflow-y-scroll flex flex-col items-center gap-10 justify-between h-full bg-gradient-to-b from-gray-100 to-gray-200">
          <div className="iconContainer relative">
            <div className="activeTab h-7 w-1 bg-blue-600 rounded-3xl absolute left-[-12px] transition-all duration-300 ease-in-out" style={{
              top: `4px`
            }}></div>
            <ul className='flex gap-5'>
              <li 
                onClick={() => createNewChat()} 
                className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100'
              >
                <img src={plus} alt="" srcSet="" className="w-6 h-6" />
              </li>
              <li className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100'>
                <img src={clock} alt="" srcSet="" className="w-6 h-6" />
              </li>
              <li className='cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full hover:bg-blue-100'>
                <img src={star} alt="" srcSet="" className="w-6 h-6" />
              </li>
            </ul>
          </div>
          <div className="chatList w-full h-full flex flex-col items-center">
            <div className="header text-center w-full">
              <h1 className='text-cyan-500 font-bold text-3xl'>Your Recent Chats</h1>
            </div>
            <ul className='inline-flex items-center flex-col justify-center w-full rounded-lg overflow-hidden shadow-md'>
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <li 
                    onClick={() => selectChat(chat.id)} 
                    className={`py-4 px-6 w-full border-b border-blue-100 cursor-pointer h-16 overflow-x-hidden hover:bg-blue-50 transition-all duration-200 text-gray-700 font-medium flex justify-between items-center ${window.location.pathname === `/chat/${chat.id}` ? 'bg-blue-100' : ''}`} 
                    key={chat.id}
                  >
                    <span>{chat.title}</span>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)} 
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))
              ) : (
                <li className="py-4 px-6 w-full text-center text-gray-500">
                  No chats yet. Create a new one!
                </li>
              )}
            </ul>
          </div>
          <div className="bottomMenu">
        
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatSideBar