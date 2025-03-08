import { useEffect, useState } from 'react'; 
import useSocket from '../../Socket/useSocket';

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

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-200">
            <div className="flex-1 flex items-center justify-center w-full">
                <div className="bg-white p-6 shadow-lg rounded-lg w-3/4 h-3/4 flex items-center justify-center">
                    <p className="text-xl font-bold">{gameState ? `Game State: ${gameState}` : 'Waiting for game state...'}</p>
                </div>
            </div>
            <div className="w-full flex justify-around p-4 bg-gray-300 shadow-md">
                {[
                    { label: 'Income', color: 'bg-red-500' },
                    { label: 'Coup', color: 'bg-blue-500' },
                    { label: 'Foreign Aid', color: 'bg-green-500' },
                    { label: 'Steal', color: 'bg-yellow-500' },
                    { label: 'Assassinate', color: 'bg-purple-500' },
                    { label: 'Tax', color: 'bg-orange-500' },
                    { label: 'Exchange', color: 'bg-teal-500' }
                ].map((button, index) => (
                    <button 
                        key={index} 
                        className={`px-4 py-2 text-white font-bold rounded-lg ${button.color} hover:opacity-75`}
                        onClick={() => handleButtonClick(button.label)}
                    >
                        {button.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
