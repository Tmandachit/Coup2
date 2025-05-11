import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import HomePage from "./Components/Home/HomePage";
import JoinLobby from "./Components/JoinLobby/JoinLobby";
import Lobby from "./Components/Lobby/Lobby"; 
import Game from "./Components/Game/Game";
import Profile from "./Components/Profile/Profile";
import "./index.css";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/Join" element={<JoinLobby />} /> 
        <Route path="/game" element={<Game />} />
        <Route path="/profile" element={<Profile />} />            
      </Routes>
    </Router>
  );
}

export default App;