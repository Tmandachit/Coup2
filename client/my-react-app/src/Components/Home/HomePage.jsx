import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import useSocket from '../../Socket/useSocket';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const firstName = sessionStorage.getItem("firstName");
  const userName = sessionStorage.getItem("userId");
  const [error, setError] = useState(null);

  const handleCreateGame = async () => {
    try {
      const response = await fetch("http://localhost:5001/createlobby");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        const lobbyCode = data.lobby;
        socket.emit('join-lobby', { username: userName, lobby: lobbyCode }, (res) => {
          if (res.status === 'ok') {
            navigate(`/lobby?lobby=${lobbyCode}`, { state: { username: userName } });
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
      <h1>Welcome to Coup, {firstName}</h1>
      <p>A game of deduction and deception</p>

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

     {/* Join Game Button */}
     <div className="input-group-btn">
        <Link className="home" to="/profile">
          Profile
        </Link>
      </div>

    </div>
  );
};

export default HomePage;