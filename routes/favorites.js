const express = require("express");

const { getFavorites, addFavorite } = require("../controllers/favorites");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getFavorites)
  .post(protect, authorize("admin", "user"), addFavorite);

module.exports = router;
