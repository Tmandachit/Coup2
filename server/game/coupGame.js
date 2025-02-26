import { buildNameSocketMap, buildNameIndexMap, buildPlayers } from './helperFunctions';
import { Actions } from './helperConstants';

class Game{

    constructor(Players, Sockets) {
        this.nameSocketMap = buildNameSocketMap(players);
        this.nameIndexMap = buildNameIndexMap(players);
        this.players = buildPlayers(players);
        this.gameSocket = gameSocket;
        this.currentPlayer = 0;
        this.deck = gameUtils.buildDeck();
        this.actions = Actions;
    }
    
}