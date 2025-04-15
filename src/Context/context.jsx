// ToggleMenu.js
import { createContext, useContext, useState,useEffect } from "react";
import axios from "axios";

// Create the context
const ToggleMenu = createContext();
const CurrentChatMapContext = createContext();


const API_URL = 'http://localhost:5000/api';


// Create a provider component
export const ToggleMenuProvider = ({ children }) => {
  
  const [chats,setChats] = useState([]);
  const [currentChatIndex,setCurrentChatIndex] = useState(0);

  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  // making a dummpy userId (would use session management for it later )
  const userId=  "user123"

  useEffect(()=>{
    const fetchChats = async () =>{
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/chats?userId=${userId}`);

        if (response.data.success) {
          setChats(response.data.data);
        }
        else {
          throw new Error(response.data.message || 'Failed to fetch chats')
        }
      } catch (err){
        setError(err.message);
        console.error('Error fetching chats:',err)
        // initialize the chats with empty array on failure of fetch request 
        setChats([])
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [userId]);

  return (
    <CurrentChatMapContext.Provider value={{currentChatIndex,setCurrentChatIndex}} >
      <ToggleMenu.Provider value={{ chats,setChats,loading,error }}>
        {children}
      </ToggleMenu.Provider>
    </CurrentChatMapContext.Provider>
  );
};

// Custom hook (optional but useful)
export const useToggleMenu = () => useContext(ToggleMenu);
export const useCurrentChatMap = ()=> useContext(CurrentChatMapContext)
