import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import axios from "axios";
import { toast } from 'react-toastify';
import { FaMusic } from 'react-icons/fa';
import { MdMusicOff } from 'react-icons/md';
import "./Lobby.css";

const Lobby = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const allReady = players.length > 0 && players.every(p => p.ready);
  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [musicOn, setMusicOn] = useState(true);
  const audioRef = useRef(null);
  
  const userName = sessionStorage.getItem("userId");

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
      const current = updatedPlayers.find(p => p.name === userName);
      setIsReady(current?.ready || false);
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

   // Music controller
  useEffect(() => {
    if (audioRef.current) {
      if (musicOn) {
        audioRef.current.play().catch((e) => console.log('Autoplay prevented', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicOn]);


  // Function to start the game
  const handleStartGame = () => {
    socket.emit('start-game', { lobbyCode });
  };

  // Leave lobby function
  const handleLeaveLobby = () => {
    socket.emit('leave-lobby', { lobbyCode, userName });
    navigate('/Home');
  };

  return (
    <div className="lobbyContainer">
     <audio ref={audioRef} loop src="/lobby-music.mp3" />
      <div className="lobbyContent">

      {/* Music Toggle Button */}
      <button
          className="musicToggleButton"
          onClick={() => setMusicOn(!musicOn)}
          title={musicOn ? "Turn Music Off" : "Turn Music On"}
        >
          {musicOn ? <FaMusic size={20} /> : <MdMusicOff size={20} />}
        </button>

        <h1
          className="lobbyCode"
          title="Click to copy"
          onClick={() => {
            navigator.clipboard.writeText(lobbyCode)
              .then(() => toast.success('Lobby code copied!'))
              .catch(err => {
                console.error('Failed to copy:', err);
                toast.error('Failed to copy lobby code.');
              });
          }}
        >
          Lobby Code: {lobbyCode}
        </h1>

        <h2>Players:</h2>

        <ul className="lobbyList">
          {players.map((player, index) => (
            <li
              key={index}
              className={player.ready ? 'playerReady' : 'playerNotReady'}
            >
              {player.name} - {player.ready ? 'Ready' : 'Not Ready'}
            </li>
          ))}
        </ul>

        {/* Ready Up Button */}
        <button
          className="readyUpButton"
          onClick={() => {
            console.log(`${isReady ? 'Unreadying' : 'Readying'} as`, { lobbyCode, userName });
            socket.emit('playerReady', { lobbyCode, userName, ready: !isReady });
            setIsReady(!isReady);
          }}
        >
          {isReady ? 'Unready' : 'Ready Up'}
        </button>

        {/* Start Game Button */}
        <button
          className="startGameButton"
          onClick={handleStartGame}
          disabled={!allReady || gameStarted}
        >
          {gameStarted ? "Game Starting..." : "Start Game"}
        </button>

        {/* Leave Lobby Button */}
        <button
          className="leaveLobbyButton"
          onClick={handleLeaveLobby}
        >
          Leave Lobby
        </button>
      </div>
    </div>
  );
};

export default Lobby;
