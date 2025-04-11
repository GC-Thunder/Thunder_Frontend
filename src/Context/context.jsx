// ToggleMenu.js
import { createContext, useContext, useState } from "react";

// Create the context
const ToggleMenu = createContext();
const CurrentChatMapContext = createContext();
const dummyChatMap = new Map([
  [
    'chat-1',
    [
      {
        isUser: true,
        content: "Hey, what's the weather like today?",
        timestamp: Date.now() - 100000,
      },
      {
        isUser: false,
        content: "Today is sunny with a high of 25°C. 😎",
        timestamp: Date.now() - 95000,
      },
    ],
  ],
  [
    'chat-2',
    [
      {
        isUser: true,
        content: "Can you help me write a poem?",
        timestamp: Date.now() - 50000,
      },
      {
        isUser: false,
        content: "Of course! Roses are red, violets are blue...",
        timestamp: Date.now() - 48000,
      },
      {
        isUser: true,
        content: "Nice! Make it about the moon.",
        timestamp: Date.now() - 47000,
      },
    ],
  ],
]);


// Create a provider component
export const ToggleMenuProvider = ({ children }) => {
  const [chatArray, setChatArray] = useState(dummyChatMap);
  const [currentChatMap, setCurrentChatMap] = useState([]);

  return (
    <CurrentChatMapContext.Provider value={{currentChatMap, setCurrentChatMap}} >
      <ToggleMenu.Provider value={{ chatArray, setChatArray }}>
        {children}
      </ToggleMenu.Provider>
    </CurrentChatMapContext.Provider>
  );
};

// Custom hook (optional but useful)
export const useToggleMenu = () => useContext(ToggleMenu);
export const useCurrentChatMap = ()=> useContext(CurrentChatMapContext)
