import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import rulesImage from './CoupRule.png';
import cheatSheetImage from './CoupCheatSheet.png';
import useSocket from '../../Socket/useSocket';
import PlayerStation from '../PlayerStation/PlayerStation';
import "./Game.css";

const Game = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();
  const userName = sessionStorage.getItem("userId");
  const [players, setPlayers] = useState([]);

  // New: Popup state
  const [popupImage, setPopupImage] = useState(null);

  const handleShowPopup = (type) => {
    if (type === 'rules') {
      setPopupImage(rulesImage);
    } else if (type === 'cheatsheet') {
      setPopupImage(cheatSheetImage); 
    }
  };

  const handleClosePopup = () => {
    setPopupImage(null);
  };

  useEffect(() => {
    if (!socket || !lobbyCode) return;
  
    socket.emit('join-game', { lobbyCode });
  
    const handleGameUpdate = (gameData) => {
      // Defensive guard — only update if the component is mounted
      setPlayers(gameData.players);
    };
  
    socket.on('game-update', handleGameUpdate);
  
    return () => {
      socket.off('game-update', handleGameUpdate);
    };
  }, [socket, lobbyCode]);
  

  // Find the current player
  const currentPlayer = players.find(p => p.name === userName);
  // Get all opponent players
  const opponents = players.filter(p => p.name !== userName);

  return (
    <div className="game-page">
      {/* Top Section: Rules & Cheat Sheet */}
      <div className='top-left-buttons'>
        <button className='small-button' onClick={() => handleShowPopup('rules')}>Rules</button>
        <button className='small-button' onClick={() => handleShowPopup('cheatsheet')}>Cheat Sheet</button>
      </div>

      {/* Fullscreen Image Popup */}
      {popupImage && (
        <div className="popup-overlay">
          <div className="popup-content">
            <img src={popupImage} alt="Popup" className="popup-image" />
            <button onClick={handleClosePopup} className="close-popup-button">✕</button>
          </div>
        </div>
      )}

      <main className="game-layout">
        {/* Opponent Cards Section */}
        <div className='opponents-container'>
          {opponents.map((player, index) => (
            <PlayerStation 
              key={index} 
              player={player} 
              isOpponent={true} 
              influences={[]}
            />
          ))}
        </div>
        {/* Player Section - with greater separation */
        console.log("Current player:", currentPlayer)
        }
        {currentPlayer && (
          <div className='player-container'>
            <PlayerStation 
              player={currentPlayer} 
              isOpponent={false} 
              influences={currentPlayer.influences}
            />
          </div>
        )}
  
        {/* Action Buttons - Fixed layout */}
        <div className='action-buttons-container'>
          <button className='income-button'>Income</button>
          <button className='coup-button'>Coup</button>
          <button className='foreign-aid-button'>Foreign Aid</button>
          <button className='steal-button'>Steal</button>
          <button className='assassinate-button'>Assassinate</button>
          <button className='tax-button'>Tax</button>
          <button className='exchange-button'>Exchange</button>
        </div>
      </main>

      {/* Event Log */}
      <div className='event-log'>
        <h2>Event Log:</h2>
        <p>Jane Doe's Turn</p>
      </div>
    </div>
  );
};

export default Game;
