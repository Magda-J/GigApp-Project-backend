const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
  // testing
  // userEvent: [{
  //   refId: { type: mongoose.Schema.Types.ObjectId, ref: "events" },
    
  // }]
  // testing
})

module.exports.User = mongoose.model('User', userSchema)