import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import { toast } from 'react-toastify';
import './JoinLobby.css';

function JoinLobby() {
  const [lobbyCode, setLobbyCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('lobby');
    if (code) setLobbyCode(code);
  }, [location]);

  const userName = sessionStorage.getItem("userId");

  const handleJoin = () => {
    if (lobbyCode.trim().length === 6) {
      socket.emit('join-lobby', { username: userName, lobby: lobbyCode }, (response) => {
        if (response.status === 'ok') {
          navigate(`/lobby?lobby=${lobbyCode}`, { state: { username: userName } });
        } else {
          toast.error(response.message || 'Failed to join the lobby.');
        }
      });
    } else {
      toast.warning('A valid 6-character lobby code is required.');
    }
  };

  return (
    <div className="joinContainer">
      <h2>Join Lobby</h2>
      <input
        type="text"
        placeholder="Lobby Code"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
        maxLength={6}
      />
      <button onClick={handleJoin}>Join Game</button>
    </div>
  );
}

export default JoinLobby;
