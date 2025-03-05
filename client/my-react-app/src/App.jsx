import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import HomePage from "./Components/Home/HomePage";
import JoinLobby from "./Components/JoinLobby/JoinLobby";
import Lobby from "./Components/Lobby/Lobby"; 
import "./index.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/Join" element={<JoinLobby />} />      
      </Routes>
    </Router>
  );
}

export default App;
