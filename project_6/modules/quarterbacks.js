let mongoose = require("mongoose");

let quarterbacksSchema = new mongoose.Schema({
    name: String,
    age: String,
    hometown: String,
    school: String,
    game:[{
      opponent: String,
      location: String,
      date: String,
      completions: String,
      attempts: String,
      yards: String,
      touchdowns: String,
      interceptions: String
     
    }]

  });

let quarterbacks = mongoose.model('quarterbacks', quarterbacksSchema);

module.exports = quarterbacks;