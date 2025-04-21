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
  const [eventLog, setEventLog] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(null);


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

  const submitAction = (action, target = null) => {
    console.log(`Action: ${action} Target: ${target}`);
    socket.emit('submit-action', {
      playerName: userName,
      action,
      target
    });
  };

  useEffect(() => {
    socket.on('game-log', (log) => {
      setEventLog(prev => [log, ...prev]);
    });
  
    socket.on('awaiting-response', (data) => {
      console.log("Received challenge/block prompt:", data);
      setAwaitingResponse(data);
    });
  
    return () => {
      socket.off('game-log');
      socket.off('awaiting-response');
    };
  }, [socket]);
  

  useEffect(() => {
    if (!socket || !lobbyCode) return;

    socket.emit('join-game', { lobbyCode });

    const handleGameUpdate = (gameData) => {
      console.log("Received game update:", gameData);
      setPlayers(gameData.players);
      setCurrentPlayer(gameData.currentPlayer);
    };

    socket.on('game-update', handleGameUpdate);

    return () => {
      socket.off('game-update', handleGameUpdate);
    };
  }, [socket, lobbyCode]);

  const myPlayer = players.find(p => p.name === userName);
  const opponents = players.filter(p => p.name !== userName);

  return (
    <div className="game-page">
      {/* Rules & Cheatsheet buttons */}
      <div className='top-left-buttons'>
        <button className='small-button' onClick={() => handleShowPopup('rules')}>Rules</button>
        <button className='small-button' onClick={() => handleShowPopup('cheatsheet')}>Cheat Sheet</button>
      </div>

      {/* Popup Overlay */}
      {popupImage && (
        <div className="popup-overlay">
          <div className="popup-content">
            <img src={popupImage} alt="Popup" className="popup-image" />
            <button onClick={handleClosePopup} className="close-popup-button">✕</button>
          </div>
        </div>
      )}

      <main className="game-layout">
        {/* Opponent Cards */}
        <div className='opponents-container'>
          {opponents.map((player, index) => (
            <PlayerStation 
              key={index}
              player={player}
              isOpponent={true}
              isTargetable={isSelectingTarget}
              onTargetClick={(targetName) => {
                submitAction(pendingAction, targetName);
                setPendingAction(null);
                setIsSelectingTarget(false);
              }}
            />
          ))}
        </div>

        {/* Player Card */}
        {myPlayer && (
          <div className='player-container'>
            <PlayerStation 
              player={myPlayer}
              isOpponent={false}
              influences={myPlayer.influences}
            />
          </div>
        )}

        {/* Turn Indicator */}
        <div className="turn-indicator">
          {currentPlayer
            ? (currentPlayer === userName
                ? "Your Turn!"
                : `${currentPlayer}'s Turn`)
            : "Waiting for game to start..."}
        </div>

        {/* Action Buttons */}
        <div className='action-buttons-container'>
          <button
            className='income-button'
            onClick={() => submitAction('income')}
            disabled={currentPlayer !== userName}
          >
            Income
          </button>

          <button
            className='coup-button'
            onClick={() => {
              setPendingAction('coup');
              setIsSelectingTarget(true);
            }}
            disabled={currentPlayer !== userName}
          >
            Coup
          </button>

          <button
            className='foreign-aid-button'
            onClick={() => submitAction('foreign aid')}
            disabled={currentPlayer !== userName}
          >
            Foreign Aid
          </button>

          <button
            className='steal-button'
            onClick={() => {
              setPendingAction('steal');
              setIsSelectingTarget(true);
            }}
            disabled={currentPlayer !== userName}
          >
            Steal
          </button>

          <button
            className='assassinate-button'
            onClick={() => {
              setPendingAction('assassinate');
              setIsSelectingTarget(true);
            }}
            disabled={currentPlayer !== userName}
          >
            Assassinate
          </button>

          <button
            className='tax-button'
            onClick={() => submitAction('tax')}
            disabled={currentPlayer !== userName}
          >
            Tax
          </button>

          <button
            className='exchange-button'
            onClick={() => submitAction('exchange')}
            disabled={currentPlayer !== userName}
          >
            Exchange
          </button>
        </div>
        {awaitingResponse && currentPlayer !== userName && (
          <div className="challenge-block-container">
            <p>
              {awaitingResponse.actor} is attempting to {awaitingResponse.action}
              {awaitingResponse.target ? ` against ${awaitingResponse.target}` : ''}.
            </p>
            <button onClick={() => socket.emit('challenge')}>Challenge</button>

            {awaitingResponse.target === userName && (
              <button onClick={() => socket.emit('block')}>Block</button>
            )}

            <button onClick={() => socket.emit('pass')}>Pass</button>
          </div>
        )}

      </main>

      {/* Event Log */}
      <div className='event-log'>
        <h2>Event Log:</h2>
        {eventLog.length === 0 ? (
          <p>No game events yet.</p>
        ) : (
          eventLog.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))
        )}
      </div>
    </div>
  );
};

export default Game;
