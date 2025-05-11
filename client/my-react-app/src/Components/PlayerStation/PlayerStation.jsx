import Card from "../Card/Card";
import Wallet from "../Wallet/Wallet";
import './PlayerStation.css';

export default function PlayerStation({ player, isOpponent, influences, isTargetable, onTargetClick }) {
  const handleClick = () => {
    if (isTargetable && onTargetClick) {
      onTargetClick(player.name);
    }
  };

  return (
    <div
      className={`station ${isOpponent ? 'opponent-station' : 'player-station'} ${isTargetable ? 'targetable' : ''}`}
      onClick={handleClick}
    >
      <h2 className="player-name">{player.name}</h2>

      <div className="cards-container">
        {isOpponent ? (
          Array.from({ length: player.influenceCount }).map((_, index) => (
            <Card key={index} role="Unknown" isRevealed={false} />
          ))
        ) : (
          Array.isArray(player.influences) &&
          player.influences.map((card, index) => (
            <Card key={index} role={card} isRevealed={true} />
          ))
        )}
      </div>

      <Wallet coins={player.money} />
    </div>
  );
}