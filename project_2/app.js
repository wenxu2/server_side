const rls = require("readline-sync");
let warehouse = require("./lib/warehouse")();
let Lot = require("./lib/lot");
let config = require("./config");

//declear location 
function user_location(row, square) {
  row: row;
  square: square;

}

let action = getActionChoice();

// Keep looping as long as they don't want to exit the program
while (action !== 3) {
  if (action === 1) {
    const thisLot = buildLot();
    const location = getLocation();

    if (warehouse.addLot(thisLot, location.row, location.square)) {
      console.log(`Lot ${thisLot.id} has been added with ${thisLot.amount} inventory at location ${location.row}, ${location.square}`);
    } else {
      console.log(`Sorry, I am unable to add the lot to location ${location.row}, ${location.square}.`);
      
    }

  } else if(action === 2) {
    // Ask the user where the current lot is, then look up a reference to that lot
    const location = getLocation();
    let sourceLot = warehouse.getLot(location.row, location.square);

    if (sourceLot && sourceLot.amount > 0) {
      // Ask the user how much they want to ship, then generate a new shipping lot and ship it
      const shippingAmount = getShipAmount(sourceLot.amount);
      let shippingLot = sourceLot.shipInventory(shippingAmount);

      warehouse.shipLot(shippingLot);
/*
     if(shippingLot.id == undefined){
        console.log(`Sorry, this lot does not contains the amount you entered`);
      }
      else{

        console.log(`Lot ${shippingLot.id} has been shipped with ${shippingAmount} inventory.`);
      }*/

      console.log(`Lot ${shippingLot.id} has been shipped with ${shippingAmount} inventory.`);
    } else {
      console.log(`Sorry, a lot with inventory can not be found at location ${location.row}, ${location.square}.`);
    }

  }
  action = getActionChoice();
}
process.exit(0);

// Gives the user a menu and gets their chosen action
function getActionChoice() {
  let user_action;
  // Represents the option chosen from this menu
  console.log("1. Add inventory to the location\n");
  console.log("2. Ship inventory from a location\n");
  console.log("3. Quit the program");
  user_action = rls.questionInt("Please enter you choice: ");

  return user_action;
}

// Interacts with the user to build a new lot object
function buildLot() {
  
  let amount = -1;
  
  while(amount <= 0 || amount > config.MAX_LOT_AMOUNT)
  {
    amount = rls.questionInt("Please enter the amount(between 0 - 100000): ");
  }

  // Get the notes as well
  let note = rls.question("Please enter your notes: ");

  var newLot = new Lot(amount, note);
  // Return a new lot object based on this input
  return newLot;
  
}

// Interacts with the user to ask how much they want to ship
function getShipAmount(currentAmount) {
  // Make sure the user enters a valid number that isn't greater than the amount that can be shipped
  let amountToShip = -1 ;
  while(amountToShip <= 0 || amountToShip > config.MAX_LOT_AMOUNT || amountToShip > currentAmount){

    amountToShip = rls.questionInt("Please enter the amount to ship: ");
  }

  return amountToShip;
  
}

// Interacts with the user to ask where a lot should be, returns an object with row and location numbers
function getLocation() {

  var newLocation = user_location;
    
  let row = -1;
  let square = -1;

  // Asks for row number 0 to 24, repeats if bad value.
  while (row < 0 || row > config.NUM_WAREHOUSE_ROWS || typeof(row)!== "number") {
    
    row = rls.questionInt("Please enter the row for the location(between 0 and 24): ");
  }

  // Asks for square number 0 to 9, repeats if bad value.
  while (square < 0 || square > config.NUM_ROW_SQUARES || typeof(square) !== "number") {
    
    square = rls.questionInt("Please enter the square for the location(between 0 and 9): ");
  }
    
    newLocation.row = row;
    newLocation.square = square;

    // Return an object containing both values
    return newLocation;

}
