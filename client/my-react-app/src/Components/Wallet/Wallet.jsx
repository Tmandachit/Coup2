import './Wallet.css';
import coin from '../Assets/coin.png';

export default function Wallet({ coins }) {
    // Show the coin count with a coin icon in a compact design
    return (
        <div className="wallet-container">
            <span className="coin-count">{coins}</span>
            <img src={coin} alt="Coin" className="coin-image" />
        </div>
    );
}