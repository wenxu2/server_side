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
      completions: Number,
      attempts: Number,
      yards: Number,
      touchdown: Number,
      intetceptions: Number,
    }]
  });

let quarterbacks = mongoose.model('quarterbacks', quarterbacksSchema);

module.exports = quarterbacks;