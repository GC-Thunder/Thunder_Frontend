import { useState } from 'react'
import "./index.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatArea from './components/chatarea';
// import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} /> */}
        <Route path='/' element={<ChatArea/>}/>
      </Routes>
    </Router>
  );
}

export default App;
