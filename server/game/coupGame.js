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
      this.io.to(this.lobbyCode).emit('clear-awaiting-response');
    }, 10000);
  }

  handleChallenge(challengerName) {
    const { type, actor, blocker, requiredCards, requiredCard, action, target } = this.awaitingResponse;
    const challenger = this.players[this.nameIndexMap[challengerName]];
  
    clearTimeout(this.challengeTimer);
    this.challengeWindowOpen = false;
  
    const claimedPlayerName = (type === 'block') ? blocker : actor;
    const claimedPlayer = this.players[this.nameIndexMap[claimedPlayerName]];
  
    const hasRequiredCard = Array.isArray(requiredCards)
      ? claimedPlayer.influences.some(card => requiredCards.includes(card))
      : claimedPlayer.influences.includes(requiredCard);
  
    if (hasRequiredCard) {
      // Challenge fails — claimed player shows proof
      const index = Array.isArray(requiredCards)
        ? claimedPlayer.influences.findIndex(card => requiredCards.includes(card))
        : claimedPlayer.influences.indexOf(requiredCard);
  
      claimedPlayer.influences.splice(index, 1);
      claimedPlayer.influences.push(this.deck.pop());
  
      const lostCard = challenger.influences.pop();
      if (challenger.influences.length === 0) challenger.isDead = true;
      this.checkWinCondition();
  
      this.broadcast(`${challengerName} challenges ${claimedPlayerName}... and fails! They lose a ${lostCard}.`);
  
      if (type === 'block') {
        this.awaitingResponse = null;
        this.endTurn();
        this.updateGameState();
      } else {
        this.resolveUnchallengedAction(); 
      }
  
    } else {
      // Challenge succeeds
      const lostCard = claimedPlayer.influences.pop();
      if (claimedPlayer.influences.length === 0) claimedPlayer.isDead = true;
      this.checkWinCondition();
  
      this.broadcast(`${challengerName} challenges ${claimedPlayerName}... and succeeds! ${claimedPlayerName} loses a ${lostCard}.`);
  
      this.awaitingResponse = null;
      this.endTurn();
      this.updateGameState();
    }
  
    this.io.to(this.lobbyCode).emit('clear-awaiting-response');
  }
    
  
  handleBlock(blockerName) {
    if (!this.awaitingResponse) return;
    
    const { action, target, canBeBlocked } = this.awaitingResponse;
    if (!canBeBlocked || blockerName !== target) {
      console.log(`Block not allowed.`);
      return;
    }
  
    let blockingCards = [];
    if (action === 'steal') blockingCards = ['ambassador', 'captain'];
    if (action === 'assassinate') blockingCards = ['contessa'];
    if (action === 'foreign aid') blockingCards = ['duke'];
  
    if (blockingCards.length === 0) {
      console.log(`Action "${action}" cannot be blocked.`);
      return;
    }
  
    this.awaitingResponse = {
      type: 'block',
      action,
      actor: this.awaitingResponse.actor,
      blocker: blockerName,
      requiredCards: blockingCards,
    };
  
    this.broadcast(`${blockerName} attempts to block ${action}. Waiting for challenge...`);
    this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
  
    this.startChallengeTimer();
  }  
  
  handleSubmit(action, targetName = null) {
    console.log(`Handling action: ${action} Target: ${targetName}`);
  
    const player = this.players[this.currentPlayer];
    if (player.isDead) return;
  
    const target = targetName ? this.players[this.nameIndexMap[targetName]] : null;
  
    // Force Coup if >10 coins
    if (player.money >= 10 && action !== this.actions.COUP) {
      console.log(`${player.name} must Coup because they have 10 or more coins.`);
      return; 
    }
  
    switch (action) {
      case this.actions.INCOME:
        player.money += 1;
        this.broadcast(`${player.name} takes Income (+1 coin).`);
        break;
  
      case this.actions.FOREIGN_AID:
        this.awaitingResponse = {
          type: 'action',
          action: 'foreign aid',
          actor: player.name,
          requiredCards: ['duke'], // Blockable by Duke
          canBeBlocked: true,
        };
        this.challengeWindowOpen = true;
        this.broadcast(`${player.name} attempts to take Foreign Aid (+2 coins). Waiting for block/challenge...`);
        this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
        this.startChallengeTimer();
        return;
  
      case this.actions.TAX:
        this.awaitingResponse = {
          type: 'action',
          action: 'tax',
          actor: player.name,
          requiredCards: ['duke'],
          canBeBlocked: false,
        };
        this.challengeWindowOpen = true;
        this.broadcast(`${player.name} claims Duke to collect Tax (+3 coins). Waiting for challenge...`);
        this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
        this.startChallengeTimer();
        return;
  
      case this.actions.ASSASSINATE:
        if (player.money < 3 || !target || target.isDead) return;
  
        this.awaitingResponse = {
          type: 'action',
          action: 'assassinate',
          actor: player.name,
          target: target.name,
          requiredCards: ['aassassin'],
          canBeBlocked: true, // Blockable by Contessa
        };
        this.challengeWindowOpen = true;
        this.broadcast(`${player.name} attempts to Assassinate ${target.name}. Waiting for block/challenge...`);
        this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
        this.startChallengeTimer();
        return;
  
      case this.actions.STEAL:
        if (!target || target.isDead) return;
  
        this.awaitingResponse = {
          type: 'action',
          action: 'steal',
          actor: player.name,
          target: target.name,
          requiredCards: ['captain'],
          canBeBlocked: true, // Blockable by Ambassador or Captain
        };
        this.challengeWindowOpen = true;
        this.broadcast(`${player.name} attempts to Steal from ${target.name}. Waiting for block/challenge...`);
        this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
        this.startChallengeTimer();
        return;
  
      case this.actions.EXCHANGE:
        this.awaitingResponse = {
          type: 'action',
          action: 'exchange',
          actor: player.name,
          requiredCards: ['ambassador'],
          canBeBlocked: false, // Exchange can only be challenged
        };
        this.challengeWindowOpen = true;
        this.broadcast(`${player.name} claims Ambassador to Exchange cards. Waiting for challenge...`);
        this.io.to(this.lobbyCode).emit('awaiting-response', this.awaitingResponse);
        this.startChallengeTimer();
        return;
  
      case this.actions.COUP:
        if (player.money < 7 || !target || target.isDead) return;
        player.money -= 7;
        const lostCard = target.influences.pop();
        if (target.influences.length === 0) target.isDead = true;
        this.broadcast(`${player.name} coups ${target.name} (they lose a ${lostCard}).`);
        this.checkWinCondition();
        break;
  
      default:
        return;
    }
  
    console.log(`${player.name} now has ${player.money} coins.`);
  
    this.endTurn();
    this.updateGameState();
  }
  

  resolveUnchallengedAction() {
    const { type, action, actor, target, blocker } = this.awaitingResponse || {};
    const actorPlayer = this.players[this.nameIndexMap[actor]];
    const targetPlayer = target ? this.players[this.nameIndexMap[target]] : null;
  
    this.awaitingResponse = null;
    this.challengeWindowOpen = false;
  
    if (type === 'block') {
      this.broadcast(`${blocker} successfully blocks the ${action}.`);
      this.endTurn();
      this.updateGameState();
      return;
    }
  
    // unchallenged
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
        this.checkWinCondition()
        break;
  
      case 'tax':
        actorPlayer.money += 3;
        this.broadcast(`${actor} successfully collects Tax (+3 coins).`);
        break;
    }
  
    this.endTurn();
    this.updateGameState();
  }
  
  checkWinCondition() {
    const alivePlayers = this.players.filter(player => !player.isDead);
  
    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      this.broadcast(`${winner.name} wins the game!`);
      
      this.io.to(this.lobbyCode).emit('game-over', { winner: winner.name });
    }
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
