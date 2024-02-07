const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: String,
  city: String,
  date: String,
  price: Number,
  description: String
})

module.exports.Event = mongoose.model('Event', eventSchema)