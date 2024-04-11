const Provider = require("../models/Provider");
const { param } = require("../routes/auth");
const vacCenter = require("../models/VacCenter");
//@desc     Get all providers
//@route    GET /api/v1/providers
//@access   Public

exports.getVacCenters = (req, res, next) => {
  vacCenter.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: "Some error occured while retriving Vaccine Centers",
      });
    else res.send(data);
  });
};

exports.getProviders = async (req, res, next) => {
  let query;

  //Copy req.puery
  const reqQuery = { ...req.query };

  //Fileds to exclude
  const removeField = ["select", "sort", "page", "limit"];

  //Loop over remove fileds and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  //Create Query String
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Provider.find(JSON.parse(queryStr));

  //Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.select(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  try {
    const total = await Provider.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //Execute query
    const providers = await query;

    //Pagination
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res
      .status(200)
      .json({ success: true, count: providers.length, data: providers });
  } catch {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single providers
//@route    GET /api/v1/providers/:id
//@access   Public

exports.getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: provider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create providers
//@route    POST /api/v1/providers
//@access   Private

exports.createProvider = async (req, res, next) => {
  const provider = await Provider.create(req.body);

  res.status(201).json({ success: true, data: provider });
};

//@desc     Update single providers
//@route    PUT /api/v1/providers/:id
//@access   Private

exports.updateProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!provider) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: provider });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single providers
//@route    DELETE /api/v1/providers/:id
//@access   Private

exports.deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
