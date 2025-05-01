import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import rulesImage from './CoupRule.png';
import cheatSheetImage from './CoupCheatSheet.png';
import useSocket from '../../Socket/useSocket';
import PlayerStation from '../PlayerStation/PlayerStation';
import confetti from 'canvas-confetti';
import "./Game.css";
import Card from "../Card/Card";


const Game = () => {
  const [searchParams] = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const socket = useSocket();
  const userName = sessionStorage.getItem("userId");
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [popupImage, setPopupImage] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isWinner, setIsWinner] = useState(false);
  const [exchangeOptions, setExchangeOptions] = useState(null);
  const [discardPrompt, setDiscardPrompt] = useState(null);


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
      setCountdown(10);
      setAwaitingResponse(data);
    });

    socket.on('clear-awaiting-response', () => {
      setCountdown(null);
      setAwaitingResponse(null);
    });    

    socket.on('game-over', ({ winner }) => {
      setWinner(winner);
      setIsWinner(userName === winner);
        
      if (userName == winner) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = 10000;
        document.body.appendChild(canvas);

        const myConfetti = confetti.create(canvas, { resize: true });

        myConfetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          document.body.removeChild(canvas);
        }, 5000);
      }    
    });

    socket.on('exchange-options', (data) => {
      if (data.actor === userName) {
        setExchangeOptions({
          ammount: data.ammount,
          cards: data.cards,
          selected: []
        });
      }
    });
    
    socket.on('awaiting-discard', (data) => {
      if (data.player === userName) {
        setDiscardPrompt({
          cards: data.cards,
          selected: null
        });
      }
    });
  
    return () => {
      socket.off('game-log');
      socket.off('awaiting-response');
      socket.off('clear-awaiting-response');
      socket.off('game-over');
      socket.off('exchange-options');
      socket.off('awaiting-discard');
    };
  }, [socket]);
  
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
  
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
  
    return () => clearTimeout(timer);
  }, [countdown]);
  

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

  useEffect(() => {
    if (winner && players.length > 0) {
      const playerUsernames = players.map(p => p.name);
      console.log("Game over! Winner:", winner);
      console.log("Updating stats for players:", playerUsernames);
  
      axios.post("http://localhost:5001/update-stats", {
        players: playerUsernames,
        winner: winner
      })
      .then(res => {
        console.log("Update response:", res.data);
      })
      .catch(err => {
        console.error("Stat update error:", err);
      });
    }
  }, [winner, players]);

  const myPlayer = players.find(p => p.name === userName);
  const opponents = players.filter(p => p.name !== userName);
  const isMyTurn = currentPlayer === userName;
  const mustCoup = myPlayer?.money >= 10;

  return (
    <div className="game-page">
      {/* Win Display */}
      {winner && (
        <div className="winner-overlay">
          <div className={`winner-popup ${isWinner ? 'victory' : 'defeat'}`}>
            <div className="winner-title">
              {isWinner ? "🏆 Champion!" : "💀 Defeated!"}
            </div>
            <p>{isWinner ? "You conquered the game!" : `${winner} wins the game.`}</p>
            <button className="small-button" onClick={() => navigate('/home')}>
              Leave
            </button>
          </div>
        </div>
      )}

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

      {/* Discard Popup */}
      {discardPrompt && (
        <div className="popup-overlay">
          <div className="popup-content exchange-popup">
            <h2>Choose a Card to Discard</h2>
            <div className="exchange-card-grid">
              {discardPrompt.cards.map((card, index) => (
                <div
                  key={index}
                  className={`exchange-card-wrapper ${discardPrompt.selected === index ? 'selected' : ''}`}
                  onClick={() => setDiscardPrompt({ ...discardPrompt, selected: index })}
                >
                  <Card role={card} isRevealed={true} />
                </div>
              ))}
            </div>

            <button
              className="small-button"
              disabled={discardPrompt.selected === null}
              onClick={() => {
                const chosenCard = discardPrompt.cards[discardPrompt.selected];
                socket.emit('submit-discard', { lobbyCode, card: chosenCard });
                setDiscardPrompt(null);
              }}
            >
              Discard Selected Card
            </button>
          </div>
        </div>
      )}

      {/* Exchange Popup */}
      {exchangeOptions && (
        <div className="popup-overlay">
          <div className="popup-content exchange-popup">
            <h2>Select {exchangeOptions.ammount} Card(s) to Keep</h2>
            <div className="exchange-card-grid">
              {exchangeOptions.cards.map((card, index) => (
                <div
                  key={index}
                  className={`exchange-card-wrapper ${exchangeOptions.selected.includes(index) ? 'selected' : ''}`}
                  onClick={() => {
                    const selected = exchangeOptions.selected;
                    const alreadySelected = selected.includes(index);

                    const newSelected = alreadySelected
                      ? selected.filter(i => i !== index)
                      : selected.length < exchangeOptions.ammount
                        ? [...selected, index]
                        : selected;

                    setExchangeOptions({ ...exchangeOptions, selected: newSelected });
                  }}
                >
                  <Card role={card} isRevealed={true} />
                </div>
              ))}
            </div>

            <button
              className="small-button"
              disabled={exchangeOptions.selected.length !== exchangeOptions.ammount}
              onClick={() => {
                const chosen = exchangeOptions.selected.map(i => exchangeOptions.cards[i]);
                socket.emit('submit-exchange', { lobbyCode, chosenCards: chosen });
                setExchangeOptions(null);
              }}
            >
              Submit Selection
            </button>
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
                setTimeout(() => setIsSelectingTarget(false), 0);
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
            onClick={() => {
              setIsSelectingTarget(false);
              submitAction('income');
            }}
            disabled={!isMyTurn || mustCoup}
          >
            {mustCoup ? "You must Coup!": "Income"}
          </button>

          <button
            className='coup-button'
            onClick={() => {
              setPendingAction('coup');
              setIsSelectingTarget(true);
            }}
            disabled={currentPlayer !== userName || myPlayer?.money < 7}
          >
            Coup
          </button>

          <button
            className='foreign-aid-button'
            onClick={() => {
              setIsSelectingTarget(false);
              submitAction('foreign aid');
            }}
            disabled={!isMyTurn || mustCoup}
          >
            {mustCoup ? "You must Coup!": "Foreign Aid"}
          </button>

          <button
            className='steal-button'
            onClick={() => {
              setPendingAction('steal');
              setIsSelectingTarget(true);
            }}
            disabled={!isMyTurn || mustCoup}
          >
            {mustCoup ? "You must Coup!": "Steal"}
          </button>

          <button
            className='assassinate-button'
            onClick={() => {
              setPendingAction('assassinate');
              setIsSelectingTarget(true);
            }}
            disabled={!isMyTurn || mustCoup || myPlayer?.money < 3}
          >
            {mustCoup ? "You must Coup!": "Assassinate"}
          </button>

          <button
            className='tax-button'
            onClick={() => {
              setIsSelectingTarget(false);
              submitAction('tax');
            }}
            disabled={!isMyTurn || mustCoup}
          >
            {mustCoup ? "You must Coup!": "Tax"}
          </button>

          <button
            className='exchange-button'
            onClick={() => {
              setIsSelectingTarget(false);
              submitAction('exchange');
            }}
            disabled={!isMyTurn || mustCoup}
          >
            {mustCoup ? "You must Coup!": "Exchange"}
          </button>
        </div>

        {/* Challenge/Block Overlay*/}
        {awaitingResponse && (
          ((awaitingResponse.type === 'action' && userName !== awaitingResponse.actor) ||
          (awaitingResponse.type === 'block' && userName === awaitingResponse.actor)) && (
            <div className="popup-overlay">
              <div className="popup-content" style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                {countdown !== null && (
                   <div className="countdown-bar-container">
                   <div 
                     className="countdown-bar"
                     style={{ width: `${(countdown / 10) * 95}%` }}
                   />
                 </div>
                )}
                {countdown !== null && (
                  <p style={{ 
                    marginTop: '10px',
                    color: countdown <= 3 ? 'red' : 'white', 
                    fontWeight: countdown <= 3 ? 'bold' : 'normal'
                  }}>
                    Time left: {countdown}s
                  </p>
                )}
                <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                  {awaitingResponse.type === 'block'
                    ? `${awaitingResponse.blocker} is blocking ${awaitingResponse.action} with ${awaitingResponse.requiredCards.join(' or ')}.`
                    : `${awaitingResponse.actor} is attempting to ${awaitingResponse.action}${awaitingResponse.target ? ` against ${awaitingResponse.target}` : ''}.`}
                </p>

                <button className="small-button" onClick={() => socket.emit('challenge')}>
                  Challenge
                </button>

                {awaitingResponse.type === 'action' && awaitingResponse.target === userName && (
                  <button className="small-button" onClick={() => socket.emit('block')}>
                    Block
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* Waiting Timer */}
        {awaitingResponse && !(
            (awaitingResponse.type === 'action' && userName !== awaitingResponse.actor) ||
            (awaitingResponse.type === 'block' && userName === awaitingResponse.actor)
          ) && (
            <div className="popup-overlay">
              <div className="popup-content" style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
                <p style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
                  {awaitingResponse.type === 'block'
                    ? `${awaitingResponse.actor} has ${countdown}s to respond to the block.`
                    : `${awaitingResponse.actor} has ${countdown}s to be challenged.`}
                </p>
              </div>
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
