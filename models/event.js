const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: String,
  city: String,
  date: String,
  price: Number,
 
  time: String,
  photo: String,
  // test
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
  // test
})

module.exports.Event = mongoose.model('Event', eventSchema)