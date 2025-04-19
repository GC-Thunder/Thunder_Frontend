import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/chatContext';
import Home from './pages/home';

const App = () => {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:chatId" element={<Home />} />
        </Routes>
      </ChatProvider>
    </Router>
  );
};

export default App;