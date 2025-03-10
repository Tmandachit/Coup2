// this component will display the player's cards and the player's wallet
import Card from "../Card/Card";
import Wallet from "../Wallet/Wallet";
import './PlayerStation.css';



export default function  PlayerStation({ player }) {
    // player is an object with the following properties:
    // name, coins, influences, eliminated, lobby, user_id

    // return player's cards plus wallet in horizontal layout
    // loop through each card object in list "player.influences"
    // a card object has attributes "role" and "isRevealed"
    return (
        <div className = "station">
            <div className="card-container">
                {player.influences.map((card, index) => (
                    <Card key={index} role={card.role} isRevealed={card.isRevealed} />
                ))}
            </div>
            <Wallet coins={player.coins} />
        </div>
    );
};