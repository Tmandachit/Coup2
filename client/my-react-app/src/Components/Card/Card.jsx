import './Card.css';
import Assassin from '../Assets/Assassin.png';
import Ambassador from '../Assets/Ambassador.png';
import Captain from '../Assets/Captain.png';
import Contessa from '../Assets/Contessa.png';
import Duke from '../Assets/Duke.png';
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
                return Captain;
            case 'Contessa':
                return Contessa;
            case 'Duke':
                return Duke;
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