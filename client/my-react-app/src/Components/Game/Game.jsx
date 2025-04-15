import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSocket from '../../Socket/useSocket';
import PlayerStation from '../PlayerStation/PlayerStation';
import "./Game.css";

const Game = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();
  const userName = sessionStorage.getItem("userId");
  const [players, setPlayers] = useState([]);

  // useEffect(() => {
  //   socket.emit('join-game', { lobbyCode });

  //   socket.on('game-update', (gameData) => {
  //     setPlayers(gameData.players);
  //   });

  //   return () => {
  //     socket.off('game-update');
  //   };
  // }, [socket, lobbyCode]);

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
        <button className='small-button'>Rules</button>
        <button className='small-button'>Cheat Sheet</button>
      </div>
  
      <main className="game-layout">
        {/* Opponent Cards Section */}
        <div className='opponents-container'>
          {opponents.map((player, index) => (
            <PlayerStation 
              key={index} 
              player={player} 
              isOpponent={true} 
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

// const Game = () => {
//   const [searchParams] = useSearchParams();
//   const lobbyCode = searchParams.get('lobby');
//   const socket = useSocket();
//   const userName = sessionStorage.getItem("userId");
//   const [players, setPlayers] = useState([]);

//   useEffect(() => {
//     socket.emit('join-game', { lobbyCode });

//     socket.on('game-update', (gameData) => {
//       setPlayers(gameData.players);
//     });

//     return () => {
//       socket.off('game-update');
//     };
//   }, [socket, lobbyCode]);

//   return (
//     <div className="game-page">
//       {/* Top Section: Rules & Cheat Sheet */}
//       <div className='top-left-buttons'>
//         <button className='small-button'>Rules</button>
//         <button className='small-button'>Cheat Sheet</button>
//       </div>
  
//       <main className="game-layout">
//         {/* Opponent Cards */}
//         <div className='player-cards'>
//           {players
//             .filter((p) => p.name !== userName)
//             .map((player, index) => (
//               <div key={index} className='player-card'>
//                 {/* <PlayerStation key={index} player={player} opponent/> */}
//                 <h2>{player.name}</h2>
//                 <p>Coins: {player.money}</p>
//                 <div className='card-placeholders'>
//                   {Array.from({ length: player.influenceCount }).map((_, i) => (
//                     <div key={i} className='card-placeholder'></div>
//                   ))}
//                 </div>
//               </div>
//           ))}
//         </div>
  
//         {/* Player Section */}
//         {players.length > 0 && (
//           <div className='my-player-card-container'>
//             {players
//               .filter((p) => p.name === userName)
//               .map((player, index) => (
//                 <div key={index} className="my-player-card">
//                   <p className="my-player-coins">Coins: {player.money}</p>
//                   <div className="my-cards-container">
//                     {Array.isArray(player.influences) && player.influences.map((card, i) => (
//                       <div key={i} className={`my-card card-${card.toLowerCase()}`}>
//                         {card}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//             ))}
//           </div>
//         )}
  
//         {/* Action Buttons */}
//         <div className='action-buttons-container'>
//           <button className='income-button'>Income</button>
//           <button className='coup-button'>Coup</button>
//           <button className='foreign-aid-button'>Foreign Aid</button>
//           <button className='steal-button'>Steal</button>
//           <button className='assassinate-button'>Assassinate</button>
//           <button className='tax-button'>Tax</button>
//           <button className='exchange-button'>Exchange</button>
//         </div>
//       </main>
  
//       {/* Event Log */}
//       <div className='event-log'>
//         <h2>Event Log:</h2>
//         <p>Jane Doe's Turn</p>
//       </div>
//     </div>
//   );
// };

// export default Game;
