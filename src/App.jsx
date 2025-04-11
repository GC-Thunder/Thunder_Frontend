
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import ChatArea from './components/chatarea';
import Home from './pages/home';


function App() {
  return (
      <Router>
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} /> */}
        <Route path='/' element={<Home/>}/>
      </Routes>
    </Router>
  );
}

export default App;
