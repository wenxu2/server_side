let mongoose = require("mongoose");

let quarterbacksSchema = new mongoose.Schema({
    

  });

let quarterbacks = mongoose.model('quarterbacks', quarterbacksSchema);

module.exports = quarterbacks;