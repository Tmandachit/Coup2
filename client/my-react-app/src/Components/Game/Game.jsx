import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import "./Game.css";

const Game = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();
  const userName = sessionStorage.getItem("userId");
  const [players, setPlayers] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("");



  useEffect(() => {
    socket.emit('join-game', { lobbyCode });

    socket.on('game-update', (gameData) => {
      console.log("Received game update:", gameData);
      setPlayers(gameData.players);
      setCurrentPlayer(gameData.currentPlayer);
    });

    return () => {
      socket.off('game-update');
    };
  }, [socket, lobbyCode]);

  useEffect(() => {
    socket.on('game-log', (log) => {
      setEventLog(prev => [log, ...prev]);
    });
  
    return () => {
      socket.off('game-log');
    };
  }, [socket]);
  

  const submitAction = (action, target = null) => {
    console.log(`Action: ${action} Target: ${target}`)
    socket.emit('submit-action', {
      playerName: userName,
      action,
      target
    });
  };

  return (
    <div className="game-page">
      {/* Top Section: Rules & Cheat Sheet */}
      <div className='top-left-buttons'>
        <button className='small-button'>Rules</button>
        <button className='small-button'>Cheat Sheet</button>
      </div>
  
      <main className="game-layout">
        {/* Opponent Cards */}
        <div className='player-cards'>
          {players
            .filter((p) => p.name !== userName)
            .map((player, index) => (
              <div key={index} className='player-card'>
                <h2>{player.name}</h2>
                <p>Coins: {player.money}</p>
                <div className='card-placeholders'>
                  {Array.from({ length: player.influences.length }).map((_, i) => (
                    <div key={i} className='card-placeholder'></div>
                  ))}
                </div>
              </div>
          ))}
        </div>
  
        {/* Player Section */}
        {players.length > 0 && (
          <div className='my-player-card-container'>
            {players
              .filter((p) => p.name === userName)
              .map((player, index) => (
                <div key={index} className="my-player-card">
                  <p className="my-player-coins">Coins: {player.money}</p>
                  <div className="my-cards-container">
                    {player.influences.map((card, i) => (
                      <div key={i} className={`my-card card-${card.toLowerCase()}`}>
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        )}
        {/* Turn Indicator */}
        <h3 className="turn-indicator">
          {currentPlayer === userName
            ? "Your turn!"
            : `${currentPlayer}'s turn`}
        </h3>

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
          onClick={() => submitAction('coup')}
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
          onClick={() => submitAction('steal')} 
          disabled={currentPlayer !== userName}
        >
          Steal
        </button>

        <button 
          className='assassinate-button' 
          onClick={() => submitAction('assassinate')} 
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
