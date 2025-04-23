jest.mock('../helperFunctions', () => ({
    buildNameSocketMap: jest.fn(() => ({ Jillian: 'sock1', Ty: 'sock2' })),
    buildNameIndexMap: jest.fn(() => ({ Jillian: 0, Ty: 1 })),
    buildPlayers: jest.fn(() => [
      { name: 'Jillian', money: 2, influences: [], isDead: false },
      { name: 'Ty', money: 2, influences: [], isDead: false }
    ]),
    buildDeck: jest.fn(() => ['duke', 'assassin', 'captain', 'ambassador']),
    shuffle: jest.fn(deck => deck),
    broadcast: jest.fn(),
    updateGameState: jest.fn()
  }));
  
  jest.mock('../helperConstants', () => ({
    Actions: {
      INCOME: 'income',
      FOREIGN_AID: 'foreign_aid',
      TAX: 'tax',
      COUP: 'coup',
      STEAL: 'steal',
      ASSASSINATE: 'assassinate'
    }
  }));
  
  const Game = require('../coupGame');
  
  describe('Game class', () => {
    let game;
  
    beforeEach(() => {
      game = new Game(['Jillian', 'Ty'], {}, {}, 'XYZ');
      // fake timers to please jest
      jest.useFakeTimers();
    });
  
    test('initializes with 2 influences per player', () => {
      expect(game.players[0].influences).toHaveLength(2);
      expect(game.players[1].influences).toHaveLength(2);
    });
  
    test('income adds 1 coin to current player', () => {
      const start = game.players[0].money;
      game.handleSubmit('income');
      expect(game.players[0].money).toBe(start + 1);
    });

    test('foreign aid adds 2 coins to current player', () => {
      const start = game.players[0].money;
      game.handleSubmit('foreign_aid');
      expect(game.players[0].money).toBe(start + 2);
    });

    test('foreign aid adds 2 coins to current player if its the second players turn', () => {
      const start = game.players[0].money;
      const start2 = game.players[1].money;
      game.endTurn();
      game.handleSubmit('foreign_aid');
      expect(game.players[1].money).toBe(start2 + 2);
    });

    test('tax sets awaiting response and opens challenge window', () => {
      const start = game.players[0].money;
      game.handleSubmit('tax');
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'tax',
        actor: 'Jillian',
        requiredCard: 'duke'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
    });

    test('tax increases players coins by 3', () => {
      const start = game.players[0].money;
      game.handleSubmit('tax');
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'tax',
        actor: 'Jillian',
        requiredCard: 'duke'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
      expect(game.players[0].money).toBe(5);
    });

    test('steal sets awaiting response and opens challenge window, and takes 2 coins', () => {
      game.players[0].money = 1; // Jillian
      game.players[1].money = 3; // Ty
      game.handleSubmit('steal', "Ty");
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'steal',
        actor: 'Jillian',
        target: 'Ty',
        requiredCard: 'captain'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
      expect(game.players[0].money).toBe(3);
      expect(game.players[1].money).toBe(1);
    });

    test('steal only takes what the player has if its less than 2', () => {
      game.players[0].money = 1; // Jillian
      game.players[1].money = 1; // Ty
      game.handleSubmit('steal', "Ty");
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'steal',
        actor: 'Jillian',
        target: 'Ty',
        requiredCard: 'captain'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
      expect(game.players[0].money).toBe(2);
      expect(game.players[1].money).toBe(0);
    });

    test('steal does nothing if target has no coins', () => {
      game.players[0].money = 1; // Jillian
      game.players[1].money = 0; // Ty
      game.handleSubmit('steal', "Ty");
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'steal',
        actor: 'Jillian',
        target: 'Ty',
        requiredCard: 'captain'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
      expect(game.players[0].money).toBe(1);
      expect(game.players[1].money).toBe(0);
    });

    test('assassinate sets awaiting response and opens challenge window, and takes 2 coins', () => {
      game.players[0].money = 4;
      game.handleSubmit('assassinate', "Ty");
      expect(game.awaitingResponse).toEqual({
        type: 'action',
        action: 'assassinate',
        actor: 'Jillian',
        target: 'Ty',
        requiredCard: 'assassin'
      });
      expect(game.challengeWindowOpen).toBe(true);
      game.resolveUnchallengedAction();
    });

    test('assassinate makes all of jillians money and one of Tys influences', () => {
      game.players[0].money = 7; // Jillian
      game.players[1].influences = ['duke', 'assassin']; // Ty
      game.handleSubmit('coup', "Ty");
      expect(game.players[0].money).toBe(0);
      expect(game.players[1].influences.length).toBe(1);
    });

    test('assassinate doesnt work with fewer than 7 coins', () => {
      game.players[0].money = 6; // Jillian
      game.players[1].influences = ['duke', 'assassin']; // Ty
      game.handleSubmit('coup', "Ty");
      expect(game.players[0].money).toBe(6);
      expect(game.players[1].influences.length).toBe(2);
    });

    test('invalid action does nothing', () => {
      const result = game.handleSubmit('invalid');
      expect(result).toBeUndefined();
    });

    test('endTurn advances to next living player', () => {
      game.currentPlayer = 0;
      game.endTurn();
      expect(game.currentPlayer).toBe(1);
    });
    
    test('endTurn skips dead players', () => {
      game.currentPlayer = 0;
      game.players[1].isDead = true;
      game.players.push({ name: 'Charlie', money: 2, influences: ['duke'], isDead: false });
    
      // add a player
      game.nameIndexMap['Charlie'] = 2;
    
      game.endTurn();
      expect(game.currentPlayer).toBe(2); // skips Ty (dead), goes to Charlie
    });

  });

  describe('getPlayerView', () => {
    let game;
  
    beforeEach(() => {
      game = new Game(['Jillian', 'Ty'], {}, {}, 'XYZ');
  
      // give influences for testing
      game.players[0].influences = ['duke', 'captain'];
      game.players[0].isDead = false;
  
      game.players[1].influences = ['assassin', null];
      game.players[1].isDead = true;
    });
  
    test('returns full info for the current player', () => {
      const socketID = 'sock1'; // Jillian socket
      const view = game.getPlayerView(socketID);
  
      const jillianView = view.find(p => p.name === 'Jillian');
      expect(jillianView).toEqual({
        name: 'Jillian',
        money: game.players[0].money,
        influences: ['duke', 'captain'],
        isDead: false
      });
    });
  
    test('returns limited info for other players', () => {
      const socketID = 'sock1'; // Jillian socket
      const view = game.getPlayerView(socketID);
  
      const TyView = view.find(p => p.name === 'Ty');
      expect(TyView).toEqual({
        name: 'Ty',
        money: game.players[1].money,
        influenceCount: 1,
        isDead: true
      });
    });
  
    test('returns accurate influence count (excluding nulls)', () => {
      game.players[1].influences = ['assassin', null];
      const view = game.getPlayerView('sock1');
  
      const TyView = view.find(p => p.name === 'Ty');
      expect(TyView.influenceCount).toBe(1);
    });
  });
  
  // put the fake timers back
  afterEach(() => {
    jest.clearAllTimers();
  });