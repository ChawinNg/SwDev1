const Favorite = require("../models/Favorite");
const Provider = require("../models/Provider");

//@desc     Get all favorites
//@route    GET /api/v1/appointments
//@access   Private
exports.getFavorites = async (req, res, next) => {
  let query;
  query = Favorite.find({ user: req.user.id });

  try {
    const favorites = await query;
    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Favorite" });
  }
};

//@desc     Add favorite
//@route    POST /api/v1/providers/:providerId/favorites/
//@access   Private
exports.addFavorite = async (req, res, next) => {
  try {
    req.body.provider = req.params.providerId;

    const provider = await Provider.findById(req.params.providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: `No provider with the id of ${req.params.providerId}`,
      });
    }

    req.body.user = req.user.id;
    const existesFavorites = await Favorite.find({
      user: req.user.id,
      provider: req.params.providerId,
    });

    if (existesFavorites.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already favorite this provider`,
      });
    }
    const favorite = await Favorite.create(req.body);

    res.status(200).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    console.log(error.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot add this provider to favorite",
    });
  }
};
