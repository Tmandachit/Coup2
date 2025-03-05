import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';

const Lobby = () => {
  // Extract lobby code from the query string
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();


  // State to hold the list of players
  const [players, setPlayers] = useState([]);

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
      console.log("Received lobby update:", updatedPlayers);
      setPlayers(updatedPlayers);
    });
    
    return () => {
      socket.off('lobby-update');
    };
  }, [socket]);
  

  return (
    <div className="lobbyContainer">
      <div className="lobbyContent">
        <h1 className="lobbyCode">Lobby Code: {lobbyCode}</h1>
        <h2 className='lobbyPlayerTitle'>Players:</h2>
        <ul className="lobbyList">
          {players.map((player, index) => (
            <li key={index} className="lobbyPlayer">{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
  
};

export default Lobby;
