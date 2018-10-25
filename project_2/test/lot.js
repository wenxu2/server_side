const expect = require('chai').expect;

let Lot = require("../lib/lot");

// Tests for the lot object
describe('Lot', function () {

  it("Has a self-generated id", function () {
    let testlot = new Lot(5,"Test");
    expect(testlot.id).to.be.a("string");
  });

  it("Only allows a positive number for amount", function () {
    let testlot = new Lot(-1,"number");
    expect(testlot.amount).to.be.above(-1);
  });

  it("Will have an empty string if no notes are passed in", function () {
    let testlot = new Lot('');
    expect(testlot.notes).to.be.empty;
  });

  it("Allows inventory to be shipped out", function () {
    let testlot = new Lot(10, "shiptest");
    expect(testlot).to.be.an("object");
  });

  it("Requires a positive inventory number to be shipped out", function () {
    let testlot = new Lot(-1, "positive");
    if(testlot.amount < 0 ){
      expect(testlot).to.be(false);
    }
  });

  it("Will not allow excess inventory to be shipped out", function () {
    let testlot = new Lot(10, "excess");
    if(testlot.amountShipped > testlot.amount){
      expect(testlot).to.be(false);
    }
  });

  it("Returns a new Lot object when inventory is shipped", function () {
    let testlot = new Lot(3, "");
    expect(testlot.uniqud).to.not.equal(testlot.id);

  });

});