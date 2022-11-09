const mongoose = require("mongoose");
const BuildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Building  Name "],
    maxlength: [20, "Your Name cannot exceed 20 characters"],
  },
});

module.exports = mongoose.model("Building", BuildingSchema);
