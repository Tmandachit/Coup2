const { buildNameSocketMap, buildNameIndexMap, buildPlayers, buildDeck, shuffle } = require('./helperFunctions');
const { Actions } = require('./helperConstants');

class Game {
  constructor(players, sockets) {
    this.nameSocketMap = buildNameSocketMap(players);
    this.nameIndexMap = buildNameIndexMap(players);
    this.players = buildPlayers(players); // initializes money, isDead, etc.
    this.gameSocket = sockets;
    this.currentPlayer = 0;
    this.deck = shuffle(buildDeck()); // Shuffle right away
    this.actions = Actions;

    for (let player of this.players) {
      player.influences.push(this.deck.pop());
      player.influences.push(this.deck.pop());
    }
    console.log("Game initialized, players dealt:", this.players);
  }

  getPlayerView(socketID) {
    console.log("Getting player view for socket:", socketID);
    // console.log("Current player:", this.nameSocketMap[player.name]);
    const playerView = this.players.map((player) => {
      const isSelf = this.nameSocketMap[player.name] === socketID;
      // console.log("is self:", isSelf);
      console.log(`Player: ${player.name}, socket: ${this.nameSocketMap[player.name]}, isSelf: ${isSelf}`);

      if (isSelf) {
        return {
          name: player.name,
          money: player.money,
          influences: player.influences,
          isDead: player.isDead
        };
      } else {
        return {
          name: player.name,
          money: player.money,
          influenceCount: player.influences.filter(i => i !== null).length,
          isDead: player.isDead
        };
      }
    });
    
    console.log("Player view:", playerView);
    return playerView;
  }
}

module.exports = Game;
