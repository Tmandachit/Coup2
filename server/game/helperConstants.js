const CardNames = {
    DUKE: "duke",
    ASSASSIN: "assassin",
    CAPTAIN: "captain",
    AMBASSADOR: "ambassador",
    CONTESSA: "contessa",
  
    values: function () {
      return [this.DUKE, this.ASSASSIN, this.CAPTAIN, this.AMBASSADOR, this.CONTESSA];
    }
  };
  
  const ActionNames = {
    INCOME: "income",
    FOREIGN_AID: "foreign aid",
    COUP: "coup",
    TAX: "tax",
    ASSASSINATE: "assassinate",
    EXCHANGE: "exchange",
    STEAL: "steal",
  
    values: function () {
      return [
        this.INCOME,
        this.FOREIGN_AID,
        this.COUP,
        this.TAX,
        this.ASSASSINATE,
        this.EXCHANGE,
        this.STEAL
      ];
    }
  };
  
  module.exports = {
    Cards: CardNames,
    Actions: ActionNames
  };