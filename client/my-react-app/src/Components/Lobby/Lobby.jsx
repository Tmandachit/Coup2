import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const Lobby = () => {
    const [searchParams] = useSearchParams();
    const lobbyCode = searchParams.get('lobby');

    // State to hold the list of players
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Fetch the list of players from the server
        // Replace '/api/lobby' with your actual API endpoint
        fetch(`http://localhost:5001/api/lobby?lobby=${lobbyCode}`)
            .then(response => response.json())
            .then(data => setPlayers(data.players))
            .catch(error => console.error('Error fetching players:', error));
    }, [lobbyCode]);

    return (
        <div>
            <h1>Lobby Code: {lobbyCode}</h1>
            <h2>Players:</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </div>
    );
};

export default Lobby;
