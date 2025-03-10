// this component will display the player's cards and the player's wallet

import { useEffect, useState } from 'react'; 
import useSocket from '../../Socket/useSocket';
import Card from "../Card/Card";
import Wallet from "../Wallet/Wallet";
import './PlayerStation.css';



export default function  PlayerStation() {
    const socket = useSocket();
    const [playerCards, setPlayerCards] = useState([]);

    // return player's cards plus wallet in horizontal layout
    return (
        <div className = "station">
            <div className="card-container">
                {playerCards.map((card, index) => (
                    <Card key={index} />
                ))}
            </div>
            <Wallet />
        </div>
    );
};