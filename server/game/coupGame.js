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
}

module.exports = Game;
