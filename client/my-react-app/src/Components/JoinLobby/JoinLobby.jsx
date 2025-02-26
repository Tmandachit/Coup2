// JoinLobby.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../SocketProvider';
import './JoinLobby.css';

function JoinLobby() {
    const [username, setUsername] = useState('');
    const [lobbyCode, setLobbyCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const socket = useSocket();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('lobby');
        if (code) setLobbyCode(code);
    }, [location]);

    const handleJoin = () => {
        if (username.trim() && lobbyCode.trim().length === 6) {
            socket.emit('join-lobby', { username, lobby: lobbyCode }, (response) => {
                if (response.status === 'ok') {
                    navigate(`/lobby/${lobbyCode}`, { state: { username } });
                } else {
                    setError(response.message || 'Failed to join the lobby.');
                }
            });
        } else {
            setError('Both username and a valid 6-character lobby code are required.');
        }
    };

    return (
        <div className="joinContainer">
            <h2>Join Lobby</h2>
            <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="text"
                placeholder="Lobby Code"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                maxLength={6}
            />
            <button onClick={handleJoin}>Join Game</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default JoinLobby;
