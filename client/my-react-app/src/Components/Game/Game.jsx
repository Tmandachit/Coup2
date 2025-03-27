import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import "./Game.css"

const Game = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();

  useEffect(() => {
    socket.emit('join-game', { lobbyCode });

    socket.on('game-update', (gameData) => {
      setPlayers(gameData.players);
    });

    return () => {
      socket.off('game-update');
    };
  }, [socket, lobbyCode]);

  return (
    <div>
      {/* Top Section: Rules & Cheat Sheet */}
      <div className='top-left-buttons'>
        <button className='small-button'>Rules</button>
        <button className='small-button'>Cheat Sheet</button>
      </div>

      {/* Opponent Cards */}
      <div className='player-cards'>
        <div className='player-card'>
          <h2>Billy Bob Jones</h2>
          <p>Coins: 5</p>
          <div className='card-placeholders'>
            <div className='card-placeholder'></div>
            <div className='card-placeholder'></div>
          </div>
        </div>

        <div className='player-card'>
          <h2>Johnny John</h2>
          <p>Coins: 2</p>
          <div className='card-placeholders'>
            <div className='card-placeholder'></div>
            <div className='card-placeholder'></div>
          </div>
        </div>
      </div>

      {/* Player Section */}
      <div className='my-player-card-container'>
        <div className="my-player-card">
            <p className="my-player-coins">Coins: 3</p>
                <div className="my-cards-container">
                <div className="my-card card-captain">Captain</div>
                <div className="my-card card-ambassador">Ambassador</div>
                </div>
            </div>
        </div>
        
      {/* Event Log */}
      <div className='event-log'>
        <h2>Event Log:</h2>
        <p>Jane Doe's Turn</p>
      </div>

      {/* Action Buttons */}
      <div className='action-buttons-container'>
        <button className='income-button'>Income</button>
        <button className='coup-button'>Coup</button>
        <button className='foreign-aid-button'>Foreign Aid</button>
        <button className='steal-button'>Steal</button>
        <button className='assassinate-button'>Assassinate</button>
        <button className='tax-button'>Tax</button>
        <button className='exchange-button'>Exchange</button>
      </div>
    </div>
  );
};

export default Game;
