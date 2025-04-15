import './Wallet.css';
import coin from '../Assets/coin.png';


// export default function Wallet({ coins }) {
//     // CURRENTLY will return grid of coin.png images for each coin in wallet
//     return (
//         <div>
//             <div className="coin-grid">
//                 {Array.from({ length: coins }).map((_, index) => (
//                     <img key={index} src={coin} alt="Coin" className="coin-image" />
//                 ))}
//             </div>
//         </div>
//     );
// }


export default function Wallet({ coins }) {
    // Show the coin count with a coin icon in a compact design
    return (
        <div className="wallet-container">
            <span className="coin-count">{coins}</span>
            <img src={coin} alt="Coin" className="coin-image" />
        </div>
    );
}