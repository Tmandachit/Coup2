const { buildNameSocketMap, buildNameIndexMap, buildPlayers, buildDeck, shuffle, updateGameState, broadcast} = require('./helperFunctions');
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
    
}

  endTurn (){
    let next = (this.currentPlayer + 1) % this.players.length;
    while (this.players[next].isDead) {
      next = (next + 1) % this.players.length;
    }
    this.currentPlayer = next;
  }

  handleSubmit(action, targetName = null) {
    const player = this.players[this.currentPlayer];
    
    if (player.isDead) {
      return; // skip if the player is dead
    }
  
    switch (action) {
      case this.actions.INCOME:
        player.coins += 1;
        this.broadcast(`${player.name} takes Income (+1 coin).`);
        break;

      case this.actions.FOREIGN_AID:
        player.coins += 2;
        this.broadcast(`${player.name} takes Foreign Aid (+2 coins).`);
        break;
        
      case this.actions.TAX:
          player.coins += 3;
          this.broadcast(`${player.name} takes Tax (+3 coins).`);
          break;
          
      case this.actions.FOREIGN_AID:
            player.coins += 2;
            this.broadcast(`${player.name} takes Foreign Aid (+2 coins).`);
            break;
      // figure out how to do the ones where you have to select another player 
      // figure out counteractions 
      
      default :
        return;
    }

    this.endTurn(); // end this player's turn
    updateGameState(); // update every players game
}
}
module.exports = Game;
