const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
  

  // test

  interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]

  // test


})

module.exports.User = mongoose.model('User', userSchema)