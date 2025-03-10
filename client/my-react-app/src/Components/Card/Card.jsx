import { useEffect, useState } from 'react'; 
import useSocket from '../../Socket/useSocket';
import './Card.css';

export default function Card() {
    const socket = useSocket();
    const [card, setCard] = useState(null);

    // get card data from server
    useEffect(() => {
        socket.on('card', (data) => {
            setCard(data);
        });
        return () => socket.off('card');
    }, [socket]);

    if (!card) {
        return <p>Loading card...</p>; // loading state while waiting for data
    }

    // determine image path
    const imagePath = card.isRevealed 
        ? `/Assets/${card.role}.png`   // show card face if faceUp is true
        : `/Assets/facedown_card.png`; // show face-down card if faceUp is false

    return (
        <div>
            <img 
                src={imagePath} 
                alt={card.isRevealed ? card.role : "Face Down Card"} 
                className={`card-image ${card.isRevealed ? '' : 'flipped'}`}
            />
            <h2 className="card-title">{card.isRevealed ? card.role : "Unknown Card"}</h2>
        </div>
    );
}