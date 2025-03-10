import './Card.css';

export default function Card({ role, isRevealed}) {
    // card role and isRevealed should be gotten from props in a higher level component

    // determine image path
    const imagePath = isRevealed 
        ? `/Assets/${role}.png`   // show card face if isRevealed is true
        : `/Assets/facedown_card.png`; // show face-down card if isRevealed is false

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