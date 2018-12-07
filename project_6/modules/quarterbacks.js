let mongoose = require("mongoose");

let quarterbacksSchema = new mongoose.Schema({
    _id: String,
    name: String,
    age: String,
    hometown: String,
    school: String,
    game:[{
      _id: String,
      opponent: String,
      location: String,
      date: String,
      completions: String,
      attempts: String,
      yards: String,
      touchdown: String,
      intetceptions: String,
    }]
  });

let quarterbacks = mongoose.model('quarterbacks', quarterbacksSchema);

module.exports = quarterbacks;