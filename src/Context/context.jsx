// MyContext.js
import { createContext, useContext, useState } from "react";

// Create the context
const MyContext = createContext();

// Create a provider component
export const MyProvider = ({ children }) => {
  const [value, setValue] = useState("Hello from Context");

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom hook (optional but useful)
export const useMyContext = () => useContext(MyContext);
