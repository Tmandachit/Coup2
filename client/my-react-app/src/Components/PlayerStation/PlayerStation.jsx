// this component will display the player's cards and the player's wallet
import Card from "../Card/Card";
import Wallet from "../Wallet/Wallet";
import './PlayerStation.css';

export default function PlayerStation({ player, isOpponent, influences }) {
    // player is an object with the following properties:
    // name, money, influences, influenceCount

    return (
        <div className={`station ${isOpponent ? 'opponent-station' : 'player-station'}`}>
            <h2 className="player-name">{player.name}</h2>
            
            <div className="cards-container">
                {isOpponent ? (
                    // For opponents, show face-down cards based on influenceCount
                    Array.from({ length: player.influenceCount }).map((_, index) => (
                        <Card key={index} role="Unknown" isRevealed={false} />
                    ))
                ) : (
                    // For client player, show actual influence cards
                    Array.isArray(player.influences) && player.influences.map((card, index) => {
                        return (
                          <Card 
                            key={index} 
                            role={card} 
                            isRevealed={true} 
                          />
                        );
                      })
                )}
            </div>
            <Wallet coins={player.money} />
        </div>
    );
}
