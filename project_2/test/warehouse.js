let expect = require('chai').expect;

// Need a lot object to add to the warehouse
let Lot = require("../lib/lot");
let warehouse = require("../lib/warehouse")();
//let app = require("../lib/app");

// Tests for the warehouse object
describe('Warehouse', function () {

  it("Contains warehouse inventory", function () {
   let whtest = new Lot();
   expect(whtest).to.be.an("object");
  });

  it("Contains outbound inventory", function () {
    expect(warehouse.getOutboundInventory()).to.be.instanceof(Array);
  });

  it("Lets you add and retrieve a lot in inventory", function () {
    var lot = new Lot(2, "new items");
    warehouse.addLot(lot, 2,2);
    expect(warehouse.getLot(2,2)).to.a.instanceOf(Lot);

  });

  it("Will return false if you try to add to an invalid inventory location", function () {
    if(warehouse.warehouseInventory > 0){
    expect(warehouse.addLot()).to.be(false);
    }
  });

  it("Will return undefined if you retrieve a non-existent lot from inventory", function () {
    let whtest = new Lot("");
    expect(whtest.warehouseInventory).to.be.an("undefined");
  });

  it("Lets you ship a lot", function () {
    let whtest = new Lot().shipInventory(1,1);
    expect(whtest).to.be.an("object");
  });
});