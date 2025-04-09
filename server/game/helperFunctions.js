const { Cards } = require("./helperConstants.js"); 

// Function to build a deck from Cards
const buildDeck = () => {
    let deck = [];
    let cardNames = Cards.values();

    for (let card of cardNames) {
        for (let i = 0; i < 3; i++) {
            deck.push(card);
        }
    }
    return deck;
};

// Function to shuffle an array
const shuffle = (arr) => {
    if (!arr) {
        console.error(`arr must not be undefined. arr was ${arr}`);
        return [];
    }

    for (let i = 0; i < arr.length * 2; i++) {
        const one = i % arr.length;
        const two = Math.floor(Math.random() * arr.length);
        let temp = arr[one];
        arr[one] = arr[two];
        arr[two] = temp;
    }
    return arr;
};

// Create a map of player names to their socket IDs
const buildNameSocketMap = (players) => {
    let map = {};
    players.forEach((x) => {
        map[x.name] = x.socketID;
    });
    return map;
};

// Create a map of player names to their index in the list
const buildNameIndexMap = (players) => {
    let map = {};
    players.forEach((x, index) => {
        map[x.name] = index;
    });
    return map;
};

// Initialize player data
const buildPlayers = (players) => {
    players.forEach(x => {
        delete x.chosen;
        x.money = 2;
        x.influences = [];
        x.isDead = false;
        delete x.isReady;
    });
    console.log(players);
    return players;
};

// Remove socket IDs before exporting player data
const exportPlayers = (players) => {
    players.forEach(x => {
        delete x.socketID;
    });
    return players;
};

// Generate a random 6-digit code
const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

module.exports = {
    generateSixDigitCode,
    buildDeck,
    shuffle,
    buildPlayers,
    exportPlayers,
    buildNameSocketMap,
    buildNameIndexMap
};
