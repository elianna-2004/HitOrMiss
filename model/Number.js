const mongoose = require("mongoose");

const numSchema = new mongoose.Schema({
   Number: {
      type: String,
      required: true
   },
   Valid: {
      type: Boolean,
      required: true
   }
});

const Number = mongoose.model("Number", numSchema);
module.exports = Number;
