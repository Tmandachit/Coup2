import './Card.css';
import Assassin from '../Assets/Assassin.png';
import Ambassador from '../Assets/Ambassador.png';
import Captain from '../Assets/Captain.png';
import Contessa from '../Assets/Contessa.png';
import Duke from '../Assets/Duke.png';
import FaceDown from '../Assets/FaceDown.png';

const cardDescriptions = {
    assassin: "Pay 3 coins to assassinate another player.",
    ambassador: "Exchange your cards with 2 from the deck. Blocks stealing.",
    captain: "Steal 2 coins from another player. Blocks stealing.",
    contessa: "Blocks an assassination attempt.",
    duke: "Take 3 coins via tax. Blocks foreign aid."
};

export default function Card({ role, isRevealed }) {
    const selectCard = (role) => {
        switch (role) {
            case 'assassin': return Assassin;
            case 'ambassador': return Ambassador;
            case 'captain': return Captain;
            case 'contessa': return Contessa;
            case 'duke': return Duke;
            default: return FaceDown;
        }
    };

    const imagePath = isRevealed ? selectCard(role) : FaceDown;

    return (
        <div className="card-container">
            <div className="card-wrapper">
                <img 
                    src={imagePath} 
                    alt={isRevealed ? role : "Face Down Card"} 
                    className={`card-image ${isRevealed ? '' : 'flipped'}`}
                />
                {isRevealed && (
                    <div className="card-tooltip">
                        {cardDescriptions[role] || "Unknown ability"}
                    </div>
                )}
            </div>
            <h2 className="card-title">{isRevealed ? role : "Unknown Card"}</h2>
        </div>
    );
}