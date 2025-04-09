import { useEffect, useState } from 'react'; 
import useSocket from '../../Socket/useSocket';
import PlayerStation from '../PlayerStation/PlayerStation';
import "./Gameboard.css"

export default function Gameboard() {
    const [gameState, setGameState] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        socket.on('gameState', (data) => {
            setGameState(data);
        });
        return () => socket.off('gameState');
    }, [socket]);

    const handleButtonClick = (action) => {
        console.log(`Button ${action} clicked`);
        socket.emit('gameAction', { action });
    };

    // FOR TESTING PURPOSES ONLY!!!!!!!!!
    const player1 = {
        name: 'Vleep Vlorp',
        coins: 3,
        influences: [
            { role: 'Assassin', isRevealed: true },
            { role: 'Ambassador', isRevealed: false }
        ],
        eliminated: false,
        lobby: 'lobbyCode',
        user_id: 'userId'
    };

    const player2 = {
        name: 'Bob Johnson',
        coins: 5,
        influences: [
            { role: 'Captain', isRevealed: true },
            { role: 'Contessa', isRevealed: true }
        ],
        eliminated: false,
        lobby: 'lobbyCode',
        user_id: 'otherId'
    };

    const player3 = {
        name: 'Joe Mama',
        coins: 5,
        influences: [
            { role: 'Duke', isRevealed: false },
            { role: 'Assassin', isRevealed: false }
        ],
        eliminated: false,
        lobby: 'lobbyCode',
        user_id: 'joeId'
    };
    

    return (
        <div className="gameboard">
            <div className="playing-field">
                <div className="opponents-container">
                    <div className="opponent-card-container">
                        <PlayerStation player={player2} />
                    </div>
                </div>
                <div className="my-player-card-container">
                    <PlayerStation player={player1} />
                </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center w-full">
                <div className="bg-white p-6 shadow-lg rounded-lg w-3/4 h-3/4 flex items-center justify-center">
                    <p className="text-xl font-bold">{gameState ? `Game State: ${gameState}` : 'Waiting for game state...'}</p>
                </div>
            </div>
            {/* TODO: gray out buttons if action not able to be taken */}
            {/* TODO: fix coloring and styling of buttons by using CSS file instead of defaults */}
            <div className="action-buttons-container">
                {[
                    { label: 'Income', className: 'income-button'},
                    { label: 'Coup', className: 'coup-button'},
                    { label: 'Foreign Aid', className: 'foreign-aid-button'},
                    { label: 'Steal', className: 'steal-button' },
                    { label: 'Assassinate', className: 'assassinate-button' },
                    { label: 'Tax', className: 'tax-button' },
                    { label: 'Exchange', className: 'exchange-button' }
                ].map((button, index) => (
                    <button 
                        key={index} 
                        className={`${button.className}`}
                        onClick={() => handleButtonClick(button.label)}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
