let mongoose = require("mongoose");

let quarterbacksSchema = new mongoose.Schema({
    name: String,
    age: String,
    hometown: String,
    school: String,
  });

let quarterbacks = mongoose.model('quarterbacks', quarterbacksSchema);

module.exports = quarterbacks;