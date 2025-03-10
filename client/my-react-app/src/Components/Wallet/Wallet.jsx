import './Wallet.css';

export default function Wallet({ coins }) {
    // CURRENTLY will return grid of coin.png images for each coin in wallet
    return (
        <div>
            <h2 className="wallet-title">Wallet</h2>
            <div className="coin-grid">
                {Array.from({ length: coins }).map((_, index) => (
                    <img key={index} src="/Assets/coin.png" alt="Coin" className="coin-image" />
                ))}
            </div>
        </div>
    );
}