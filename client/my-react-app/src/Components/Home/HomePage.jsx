import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import useSocket from '../../Socket/useSocket';
import axios from "axios";
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  const firstName = sessionStorage.getItem("firstName");
  const userName = sessionStorage.getItem("userId");
  const [error, setError] = useState(null);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.post("http://localhost:5001/leaderboard");

      if (response.status === 200) {
        setLeaderboard(response.data);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  };

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
            console.error(res.message || 'Failed to join lobby.');
          }
        });
      } else {
        const text = await response.text();
        console.error("Expected JSON, but received:", text);
      }
    } catch (err) {
      console.error("Error creating lobby:", err);
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

      {/* Profile Button */}
      <div className="input-group-btn">
        <Link className="home" to="/profile">
          Profile
        </Link>
      </div>

      {
        /* Leaderboard Code 
            This is a Stretch Goal Achieved!
        */
      }

      {/* Leaderboard Button */}
      <div className="input-group-btn">
        <button className="home" onClick={() => {
          setIsLeaderboardOpen(true);
          fetchLeaderboard();
        }}>
          Leaderboard
        </button>
      </div>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>Leaderboard</h1>
            <ul className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <li className="leaderboard-item">Loading...</li>
              ) : (
                leaderboard.map((player, index) => {
                  const winText = player.gamesWon === 1 ? "Win" : "Wins";
                  return (
                    <li key={index} className="leaderboard-item">
                      <span className="player-rank">0{index + 1}.</span>{' '}
                      <span className="player-name">
                        {player.firstName} {player.lastName}
                      </span>{' '}
                      <span className="player-stats">– {player.gamesWon} {winText}</span>
                    </li>
                  );
                })
              )}
            </ul>
            <button onClick={() => setIsLeaderboardOpen(false)}>X</button>
          </div>
        </div>
      )}


    </div>
  );
};

export default HomePage;
