
class Player {
    constructor(name, index) {
        this.name = name;
        this.coins = 2; // player starts with 2 coins
        this.influence = []; // player begins with 2 influences, to be set later
        this.alive = true;
        this.isConnected = true;
        this.isTurn = false;     
        this.playerIndex = index;                  
    }

    setInfluence(roles) {
        if (roles.length !== 2) {
            throw new Error("A player must have exactly two roles.");
        }
        this.influence = roles;
    }

    loseInfluence(role) {
        const index = this.influence.indexOf(role);
        if (index !== -1) {
            this.influence.splice(index, 1);
        }
        if (this.influence.length === 0) {
            this.alive = false;
        }
    }

    income() {
        this.coins += 1;
    }

    foreignAid() {
        this.coins += 2;
    }

    coup(target) {
        if (this.coins < 7) {
            throw new Error("Not enough coins to launch a Coup.");
        }
        this.coins -= 7;
        // this doesn't actually work, needs to be able to choose which one to lose
        target.loseInfluence(target.influence[0]);
    }

    canAffordCoup() {
        return this.coins >= 7;
    }
}

export default Player;