const { buildNameSocketMap, buildNameIndexMap, buildPlayers, buildDeck, shuffle, updateGameState, broadcast} = require('./helperFunctions');
const { Actions } = require('./helperConstants');

class Game {
  constructor(players, sockets, io, lobbyCode) {
    this.nameSocketMap = buildNameSocketMap(players);
    this.nameIndexMap = buildNameIndexMap(players);
    this.players = buildPlayers(players);
    this.gameSocket = sockets;
    this.currentPlayer = 0;
    this.deck = shuffle(buildDeck());
    this.actions = Actions;
    this.io = io;
    this.lobbyCode = lobbyCode;
  
    this.broadcast = (msg) => broadcast(this.io, this.lobbyCode, msg);
    this.updateGameState = () => updateGameState(this, this.io, this.lobbyCode);
  
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
    console.log(`Handling action: ${action} Target: ${targetName}`)

    const player = this.players[this.currentPlayer];
    if (player.isDead) return;
  
    const target = targetName ? this.players[this.nameIndexMap[targetName]] : null;

    switch (action) {
      case this.actions.INCOME:
        player.money += 1;
        this.broadcast(`${player.name} takes Income (+1 coin).`);
        break;
  
      case this.actions.FOREIGN_AID:
        player.money += 2;
        this.broadcast(`${player.name} takes Foreign Aid (+2 coins).`);
        break;
  
      case this.actions.TAX:
        player.money += 3;
        this.broadcast(`${player.name} takes Tax (+3 coins).`);
        break;
  
      case this.actions.COUP:
        if (player.money < 7 || !target || target.isDead) return;
        player.money -= 7;
        const lostCard = target.influences.pop();
        if (target.influences.length === 0) target.isDead = true;
        this.broadcast(`${player.name} coups ${target.name} (they lose a ${lostCard}).`);
        break;
  
      case this.actions.STEAL:
        if (!target || target.isDead) return;
        const stolen = Math.min(2, target.money);
        target.money -= stolen;
        player.money += stolen;
        this.broadcast(`${player.name} steals ${stolen} coin(s) from ${target.name}.`);
        break;
  
      case this.actions.ASSASSINATE:
        if (player.money < 3 || !target || target.isDead) return;
        player.money -= 3;
        const assassinatedCard = target.influences.pop();
        if (target.influences.length === 0) target.isDead = true;
        this.broadcast(`${player.name} assassinates ${target.name} (they lose a ${assassinatedCard}).`);
        break;
  
      default:
        return;
    }

    console.log(`${player.name} now has ${player.money} coins.`);

    this.endTurn();
    this.updateGameState();

  }
  
}

module.exports = Game;
