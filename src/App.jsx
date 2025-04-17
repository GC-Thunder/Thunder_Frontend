// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToggleMenuProvider } from './Context/context';
import Home from './pages/home';

function App() {
  return (
    <ToggleMenuProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:chatId" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToggleMenuProvider>
  );
}

export default App;