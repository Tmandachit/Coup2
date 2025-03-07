import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import axios from "axios";
import "./Lobby.css";

const Lobby = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby'); // Extract lobby code from URL
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (lobbyCode) {
      fetch(`http://localhost:5001/lobby/${lobbyCode}/players`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setPlayers(data.players))
        .catch((error) => console.error('Error fetching players:', error));
    } else {
      console.log('Lobby code not provided');
    }
  }, [lobbyCode]);

  useEffect(() => {
    socket.on('lobby-update', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('game-started', () => {
      setGameStarted(true);
      navigate(`/game?lobby=${lobbyCode}`);
    });

    return () => {
      socket.off('lobby-update');
      socket.off('game-started');
    };
  }, [socket, navigate, lobbyCode]);

  // Function to start the game
  const handleStartGame = () => {
    socket.emit('start-game', { lobbyCode });
  };

  return (
    <div className="lobbyContainer">
      <div className="lobbyContent">
        <h1 className="lobbyCode">Lobby Code: {lobbyCode}</h1>
        <h2>Players:</h2>
        <ul className="lobbyList">
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        <button 
          className="startGameButton" 
          onClick={handleStartGame} 
          disabled={gameStarted}
        >
          {gameStarted ? "Game Starting..." : "Start Game"}
        </button>
      </div>
    </div>
  );
};

export default Lobby;
