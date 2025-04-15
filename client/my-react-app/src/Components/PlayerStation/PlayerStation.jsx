// this component will display the player's cards and the player's wallet
import Card from "../Card/Card";
import Wallet from "../Wallet/Wallet";
import './PlayerStation.css';



// export default function  PlayerStation({ player, opponent }) {

//     // player is an object with the following properties:
//     // name, coins, influences, eliminated, lobby, user_id

//     // return player's cards plus wallet in horizontal layout
//     // loop through each card object in list "player.influences"
//     // a card object has attributes "role" and "isRevealed"
//     return (
//         <div className = "station">
            
//             <div className="cards-container">
//                 {player.influences.map((card, index) => (
//                     <Card key={index} role={card.role} isRevealed={card.isRevealed} />
//                 ))}
//             </div>
//             <Wallet coins={player.money} />
//         </div>
//     );
// };


export default function PlayerStation({ player, isOpponent }) {
    // player is an object with the following properties:
    // name, money, influences, influenceCount

    return (
        <div className={`station ${isOpponent ? 'opponent-station' : 'player-station'}`}>
            <h2 className="player-name">{player.name}</h2>
            
            <div className="cards-container">
                {isOpponent ? (
                    // For opponents, show face-down cards based on influenceCount
                    Array.from({ length: player.influenceCount }).map((_, index) => (
                        console.log('Opponent card: ', _),
                        <Card key={index} role="Unknown" isRevealed={false} />
                    ))
                ) : (
                    // For client player, show actual influence cards
                    Array.isArray(player.influences) && player.influences.map((card, index) => (
                        console.log('Player card: ', card.role),
                        <Card key={index} role={card.role} isRevealed={true} />
                    ))
                    
                )}
            </div>
            <Wallet coins={player.money} />
        </div>
    );
}