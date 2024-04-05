const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: "Provider",
    required: true,
  },
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
