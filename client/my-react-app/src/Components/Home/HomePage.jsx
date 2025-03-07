import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useSocket from '../../Socket/useSocket';
import jillian from '../Assets/jillybackground.jpeg';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError('Please enter your name before creating a game.');
      return;
    }
    try {
      const response = await fetch("http://localhost:5001/createlobby");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        const lobbyCode = data.lobby;
        socket.emit('join-lobby', { username, lobby: lobbyCode }, (res) => {
          if (res.status === 'ok') {
            navigate(`/lobby?lobby=${lobbyCode}`, { state: { username } });
          } else {
            setError(res.message || 'Failed to join lobby.');
          }
        });
      } else {
        const text = await response.text();
        console.error("Expected JSON, but received:", text);
      }
    } catch (err) {
      console.error("Error creating lobby:", err);
      setError("Error creating lobby.");
    }
  };

  return (
    <div className="homeContainer">
      <h1>Welcome to Coup</h1>
      <p>A game of deduction and deception</p>

      {/* Player name input */}
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
      </div>

      {/* Create Game Button */}
      <div className="input-group-btn">
        <button className="home" onClick={handleCreateGame}>
          Create Game
        </button>
      </div>

      {/* Join Game Button */}
      <div className="input-group-btn">
        <Link className="home" to="/join">
          Join Game
        </Link>
      </div>
    </div>
  );
};

export default HomePage;