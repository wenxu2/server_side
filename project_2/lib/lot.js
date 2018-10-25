const uniqud = require("uniqid");

// An object that represents a lot of inventory in the warehouse.
class Lot {
  constructor(amount, notes) {
    this.id = uniqud(); // Generates a new id each time this constructor is called
    this.amount = typeof amount === "number" && amount > 0 ? amount : 0;
    this.notes = notes || '';

    // Ships inventory from the system
    this.shipInventory = function (amountShipped) {

      // returns a new lot object containing the inventory amount and a copy of the notes, with a brand new lot id
      
      // If an invalid ship action is attempted, the function should return false
      if(amount < 0 || amountShipped > amount || amountShipped < 0){

        return false;

      }else{

        // decrements the inventory amount
    
        var newLot = new Lot(amount - amountShipped, this.notes);
        return newLot;
        
      }
    };
  }
}

module.exports = Lot;
