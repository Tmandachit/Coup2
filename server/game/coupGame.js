const { buildNameSocketMap, buildNameIndexMap, buildPlayers, buildDeck, shuffle, broadcast, updateGameState } = require('./helperFunctions');
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
    this.awaitingResponse = null;
    this.challengeWindowOpen = false;
    this.challengeTimer = null;
  
    this.broadcast = (msg) => broadcast(this.io, this.lobbyCode, msg);
    this.updateGameState = () => updateGameState(this, this.io);
  
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

  startChallengeTimer() {
    if (this.challengeTimer) clearTimeout(this.challengeTimer);
  
    this.challengeTimer = setTimeout(() => {
      this.resolveUnchallengedAction();
    }, 10000);
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
          this.awaitingResponse = {
            type: 'action',
            action: 'tax',
            actor: player.name,
            requiredCard: 'duke'
          };
        
          this.challengeWindowOpen = true;
          this.broadcast(`${player.name} attempts to collect tax (+3 coins). Waiting for challenge...`);
          this.startChallengeTimer();
          return;
        
  
      case this.actions.COUP:
        if (player.money < 7 || !target || target.isDead) return;
        player.money -= 7;
        const lostCard = target.influences.pop();
        if (target.influences.length === 0) target.isDead = true;
        this.broadcast(`${player.name} coups ${target.name} (they lose a ${lostCard}).`);
        break;
  
        case this.actions.STEAL:
          if (!target || target.isDead) return;
        
          this.awaitingResponse = {
            type: 'action',
            action: 'steal',
            actor: player.name,
            target: target.name,
            requiredCard: 'captain'
          };
        
          this.challengeWindowOpen = true;
          this.broadcast(`${player.name} attempts to steal from ${target.name}. Waiting for challenge...`);
          this.startChallengeTimer();
          return;
  
          case this.actions.ASSASSINATE:
            if (player.money < 3 || !target || target.isDead) return;
          
            this.awaitingResponse = {
              type: 'action',
              action: 'assassinate',
              actor: player.name,
              target: target.name,
              requiredCard: 'assassin'
            };
          
            this.challengeWindowOpen = true;
            this.broadcast(`${player.name} attempts to assassinate ${target.name}. Waiting for challenge...`);
            this.startChallengeTimer();
            return;
  
      default:
        return;
    }

    console.log(`${player.name} now has ${player.money} coins.`);

    this.endTurn();
    this.updateGameState();
  }

  resolveUnchallengedAction() {
    if (!this.awaitingResponse) return;
    const { action, actor, target } = this.awaitingResponse;
    const actorPlayer = this.players[this.nameIndexMap[actor]];
    const targetPlayer = target ? this.players[this.nameIndexMap[target]] : null;

    this.awaitingResponse = null;
    this.challengeWindowOpen = false;

    switch (action) {
      case 'steal':
        const stolen = Math.min(2, targetPlayer.money);
        targetPlayer.money -= stolen;
        actorPlayer.money += stolen;
        this.broadcast(`${actor} successfully steals ${stolen} coin(s) from ${target}.`);
        break;

      case 'assassinate':
        actorPlayer.money -= 3;
        const lost = targetPlayer.influences.pop();
        if (targetPlayer.influences.length === 0) targetPlayer.isDead = true;
        this.broadcast(`${actor} successfully assassinates ${target} (they lose a ${lost}).`);
        break;

      case 'tax':
        actorPlayer.money += 3;
        this.broadcast(`${actor} successfully collects Tax (+3 coins).`);
        break;
    }

    this.endTurn();
    this.updateGameState();
  }

  getPlayerView(socketID) {
    const playerView = this.players.map((player) => {
      const isSelf = this.nameSocketMap[player.name] === socketID;

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
    
    return playerView;
  }
}

module.exports = Game;
