let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

let User = mongoose.model('users', userSchema);

module.exports = User;