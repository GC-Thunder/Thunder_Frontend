import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchChats } from '../api/apiService';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        // Replace with actual user ID from auth system
        const userId = "user123";
        const fetchedChats = await fetchChats(userId);
        setChats(fetchedChats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chats:', error);
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  return (
    <ChatContext.Provider value={{ 
      chats, 
      setChats, 
      currentChat, 
      setCurrentChat, 
      loading 
    }}>
      {children}
    </ChatContext.Provider>
  );
};