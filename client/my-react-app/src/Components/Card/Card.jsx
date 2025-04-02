import './Card.css';
import Assassin from '../Assets/Assassin.png';
import Ambassador from '../Assets/Ambassador.png';
import FaceDown from '../Assets/FaceDown.png';

export default function Card({ role, isRevealed}) {
    // card role and isRevealed should be gotten from props in a higher level component

    // Function to select the card image based on role
    const selectCard = (role) => {
        switch (role) {
            case 'Assassin':
                return Assassin;
            case 'Ambassador':
                return Ambassador;
            case 'Captain':
                return FaceDown;
            case 'Contessa':
                return FaceDown;
            case 'Duke':
                return FaceDown;
            default:
                return FaceDown;
        }
    };

    // determine image path
    const imagePath = isRevealed 
        ? selectCard(role)   // show card face if isRevealed is true
        : FaceDown; // show face-down card if isRevealed is false
    
    console.log(imagePath)

    

    return (
        <div className="card-container">
            <img 
                src={imagePath} 
                alt={isRevealed ? role : "Face Down Card"} 
                className={`card-image ${isRevealed ? '' : 'flipped'}`}
            />
            <h2 className="card-title">{isRevealed ? role : "Unknown Card"}</h2>
        </div>
    );
}