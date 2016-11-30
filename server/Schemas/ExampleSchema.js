var mongoose = require('mongoose');

var exampleSchema = mongoose.Schema({
      lat: Number,
      lng: Number,
      name: String,
      uuid: String
});

module.exports = mongoose.model('example', exampleSchema);