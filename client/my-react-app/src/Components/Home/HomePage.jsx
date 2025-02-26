import { Link, useNavigate } from "react-router-dom";
import jillian from '../Assets/jillybackground.jpeg';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate(); // Hook for navigation

     /** Create a new game lobby and redirect to the join page */
    const handleCreateGame = async () => {
        try {
            const response = await fetch("http://localhost:5001/createlobby");

            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Check if the Content-Type is application/json
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                navigate(`/lobby?lobby=${data.lobby}`); // Redirect to the Join Game page with the lobby code
            } else {
                // If not JSON, log the response text for debugging
                const text = await response.text();
                console.error("Expected JSON, but received:", text);
            }
        } catch (err) {
            console.error("Error creating lobby:", err);
        }
    };

    return (  
        <div className="homeContainer">
            <h1>Welcome to Coup</h1>
            <p>A game of deduction and deception</p>
            <img src={jillian} alt="chicken-leg"/>

            {/* Create Game Button */}
            <div className="input-group-btn">
                <button className="home" onClick={handleCreateGame}>Create Game</button>
            </div>

            {/* Join Game Button (Navigates to Join Page) */}
            <div className="input-group-btn">
                <Link className="home" to="/join">Join Game</Link>
            </div>
        </div>
    );
};

export default HomePage;
